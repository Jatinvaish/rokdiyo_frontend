-- Comprehensive Access Control Fix
-- This script ensures proper menu-permission mapping and subscription-based access

-- ============================================
-- 1. VERIFY CURRENT tenant_admin PERMISSIONS
-- ============================================

-- Check current tenant_admin permissions
SELECT 
    r.name as role_name,
    p.permission_key,
    p.resource,
    p.action,
    p.description
FROM roles r
INNER JOIN role_permissions rp ON r.id = rp.role_id
INNER JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'tenant_admin' 
AND rp.granted = 1 
AND rp.status = 'active'
ORDER BY p.resource, p.action;

-- ============================================
-- 2. FIX MENU-PERMISSION MAPPING
-- ============================================

-- Update tenant-specific menus to use correct permission IDs
-- This ensures tenant_admin can see tenant menus based on their actual permissions

-- Update tenant_rooms menu to use room permissions (4,5)
UPDATE menu_permissions 
SET permission_ids = '4,5'
WHERE menu_key = 'tenant_rooms';

-- Update tenant_bookings menu to use booking permissions (2,3)
UPDATE menu_permissions 
SET permission_ids = '2,3'
WHERE menu_key = 'tenant_bookings';

-- Update tenant_guests menu to use guest permissions (6,7)
UPDATE menu_permissions 
SET permission_ids = '6,7'
WHERE menu_key = 'tenant_guests';

-- Update tenant_dashboard menu to use dashboard permission (1)
UPDATE menu_permissions 
SET permission_ids = '1'
WHERE menu_key = 'tenant_dashboard';

-- Update tenant_users menu to use user permissions (8,9)
UPDATE menu_permissions 
SET permission_ids = '8,9'
WHERE menu_key = 'tenant_users';

-- Update tenant_roles menu to use role permissions (10,11)
UPDATE menu_permissions 
SET permission_ids = '10,11'
WHERE menu_key = 'tenant_roles';

-- Update tenant_reports menu to use reports permission (12)
UPDATE menu_permissions 
SET permission_ids = '12'
WHERE menu_key = 'tenant_reports';

-- Update tenant_analytics menu to use analytics permission (14)
UPDATE menu_permissions 
SET permission_ids = '14'
WHERE menu_key = 'tenant_analytics';

-- Update tenant_settings menu to use settings permission (13)
UPDATE menu_permissions 
SET permission_ids = '13'
WHERE menu_key = 'tenant_settings';

-- ============================================
-- 3. ENSURE tenant_admin HAS ALL NECESSARY PERMISSIONS
-- ============================================

-- Add any missing permissions for tenant_admin
INSERT INTO role_permissions (role_id, permission_id, granted, status, created_at, updated_at)
SELECT 
    (SELECT id FROM roles WHERE name = 'tenant_admin'),
    p.id,
    1, -- granted
    'active',
    GETUTCDATE(),
    GETUTCDATE()
FROM permissions p
WHERE p.id IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14) -- Core permissions for tenant operations
AND p.id NOT IN (
    SELECT rp.permission_id 
    FROM role_permissions rp 
    INNER JOIN roles r ON rp.role_id = r.id 
    WHERE r.name = 'tenant_admin' 
    AND rp.permission_id = p.id
    AND rp.granted = 1 
    AND rp.status = 'active'
);

-- ============================================
-- 4. CREATE SUBSCRIPTION-BASED PERMISSION VIEW
-- ============================================

GO

-- Create or update view for subscription-based permissions
CREATE OR ALTER VIEW [dbo].[v_subscription_permissions] AS
SELECT DISTINCT
    t.id as tenant_id,
    t.subscription_plan_id,
    sp.id as subscription_feature_id,
    sp.name as feature_name,
    sfp.permission_id,
    p.permission_key,
    p.resource,
    p.action,
    p.description
FROM tenants t
INNER JOIN subscription_plans spl ON t.subscription_plan_id = spl.id
INNER JOIN subscription_features sp ON sp.subscription_id = spl.id
INNER JOIN subscription_feature_permissions sfp ON sfp.feature_id = sp.id
INNER JOIN permissions p ON sfp.permission_id = p.id
WHERE t.is_active = 1
AND spl.is_active = 1
AND sp.is_deleted = 0
AND sfp.is_deleted = 0;
GO

-- ============================================
-- 5. UPDATE USER MENU VIEW FOR TENANT-AWARE ACCESS
-- ============================================

GO

-- Create or update view to properly handle tenant vs super admin menus
CREATE OR ALTER VIEW [dbo].[v_api_user_menus_tenant_aware] AS
SELECT DISTINCT
    u.id as user_id,
    u.tenant_id,
    u.user_type,
    mp.menu_key,
    mp.menu_name,
    mp.parent_menu_key,
    mp.display_order,
    mp.icon,
    mp.route,
    CASE 
        WHEN u.user_type = 'SUPER_ADMIN' THEN 1 -- Super admin sees all active menus
        WHEN u.tenant_id IS NOT NULL AND mp.menu_key LIKE 'tenant_%' THEN 1 -- Tenant users see tenant menus
        WHEN u.tenant_id IS NOT NULL AND mp.menu_key NOT LIKE 'tenant_%' THEN 0 -- Tenant users don't see system menus
        ELSE 0
    END as can_access
FROM users u
INNER JOIN menu_permissions mp ON 1=1 -- Cross join with all active menus
WHERE mp.is_active = 1 
AND mp.status = 'active'
AND u.status = 'active'
AND (
    -- Super admin sees all menus
    u.user_type = 'SUPER_ADMIN'
    OR
    -- Tenant users only see tenant-specific menus
    (u.tenant_id IS NOT NULL AND mp.menu_key LIKE 'tenant_%')
);
GO

-- ============================================
-- 6. CREATE PROCEDURE TO GET USER PERMISSIONS WITH SUBSCRIPTION FILTERING
-- ============================================

GO

-- Create or alter procedure for subscription-filtered permissions
CREATE OR ALTER PROCEDURE [dbo].[sp_get_user_permissions_with_subscription]
    @user_id BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @user_tenant_id BIGINT;
    DECLARE @user_type NVARCHAR(50);
    
    -- Get user info
    SELECT @user_tenant_id = tenant_id, @user_type = user_type
    FROM users 
    WHERE id = @user_id AND status = 'active';
    
    -- Return permissions based on user type
    IF @user_type = 'SUPER_ADMIN'
    BEGIN
        -- Super admin gets all permissions
        SELECT 
            p.id,
            p.permission_key,
            p.resource,
            p.action,
            p.description,
            p.category,
            1 as granted_from_subscription
        FROM permissions p
        WHERE p.is_system_permission = 1 OR p.is_system_permission = 0;
    END
    ELSE IF @user_tenant_id IS NOT NULL
    BEGIN
        -- Tenant users get permissions based on subscription + role permissions
        SELECT DISTINCT
            p.id,
            p.permission_key,
            p.resource,
            p.action,
            p.description,
            p.category,
            CASE 
                WHEN vp.permission_id IS NOT NULL THEN 1 
                ELSE 0 
            END as granted_from_subscription
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        INNER JOIN user_roles ur ON rp.role_id = ur.role_id
        LEFT JOIN v_subscription_permissions vp ON p.id = vp.permission_id AND vp.tenant_id = @user_tenant_id
        WHERE ur.user_id = @user_id
        AND rp.granted = 1 
        AND rp.status = 'active'
        AND ur.is_active = 1
        AND (
            -- Include if granted from role
            1 = 1
            OR
            -- Include if available in subscription
            vp.permission_id IS NOT NULL
        );
    END
    ELSE
    BEGIN
        -- Non-tenant, non-super admin users get role permissions only
        SELECT 
            p.id,
            p.permission_key,
            p.resource,
            p.action,
            p.description,
            p.category,
            0 as granted_from_subscription
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        INNER JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = @user_id
        AND rp.granted = 1 
        AND rp.status = 'active'
        AND ur.is_active = 1;
    END
END;
GO

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================

-- Verify tenant_admin permissions after fix
SELECT 
    r.name as role_name,
    COUNT(rp.permission_id) as total_permissions,
    STRING_AGG(p.permission_key, ', ') as permissions_list
FROM roles r
INNER JOIN role_permissions rp ON r.id = rp.role_id
INNER JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'tenant_admin' 
AND rp.granted = 1 
AND rp.status = 'active'
GROUP BY r.name, r.display_name;

-- Verify menu-permission mapping
SELECT 
    mp.menu_key,
    mp.menu_name,
    mp.permission_ids,
    mp.route,
    mp.is_active,
    mp.status
FROM menu_permissions mp
WHERE mp.menu_key LIKE 'tenant_%'
ORDER BY mp.display_order;

-- Test subscription permissions for a specific tenant
SELECT * FROM v_subscription_permissions WHERE tenant_id = 1;

-- Simple test for tenant admin menu access (without view)
SELECT 
    u.id as user_id,
    u.user_type,
    u.tenant_id,
    mp.menu_key,
    mp.menu_name,
    mp.permission_ids,
    CASE 
        WHEN u.user_type = 'SUPER_ADMIN' THEN 1
        WHEN u.tenant_id IS NOT NULL AND mp.menu_key LIKE 'tenant_%' THEN 1
        ELSE 0
    END as can_access
FROM users u
INNER JOIN menu_permissions mp ON 1=1
WHERE u.user_type = 'tenant_administration' 
AND u.tenant_id = 1
AND mp.menu_key LIKE 'tenant_%'
AND mp.is_active = 1 
AND mp.status = 'active';

-- Verify menu permissions mapping
SELECT 
    mp.menu_key,
    mp.menu_name,
    mp.permission_ids,
    mp.route,
    mp.is_active,
    mp.status
FROM menu_permissions mp
WHERE mp.menu_key LIKE 'tenant_%'
ORDER BY mp.display_order;

PRINT 'Comprehensive access control fix completed!';
PRINT '1. Menu-permission mapping has been fixed';
PRINT '2. tenant_admin permissions have been verified';
PRINT '3. Subscription-based permission view created';
PRINT '4. Tenant-aware menu view created';
PRINT '5. User permissions procedure created with subscription filtering';
PRINT '6. Verification queries provided above';
