-- Fix Tenant Admin Access to Rooms and Related Pages
-- This script ensures tenant_admin role can access rooms and related functionality

-- First, let's verify current tenant_admin permissions
SELECT 
    r.name as role_name,
    r.display_name,
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

-- Check if tenant_admin has rooms permissions
SELECT 
    COUNT(*) as rooms_permissions_count
FROM roles r
INNER JOIN role_permissions rp ON r.id = rp.role_id
INNER JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'tenant_admin' 
AND p.resource = 'rooms'
AND rp.granted = 1 
AND rp.status = 'active';

-- Check tenant-specific menu permissions for rooms
SELECT 
    mp.menu_key,
    mp.menu_name,
    mp.permission_ids,
    mp.route
FROM menu_permissions mp
WHERE mp.menu_key LIKE '%tenant_room%'
   OR mp.menu_key = 'tenant_rooms'
   OR (mp.menu_key = 'rooms' AND mp.menu_name = 'Rooms')
ORDER BY mp.display_order;

-- Ensure tenant_admin has all necessary rooms permissions
-- Insert missing permissions if they don't exist
INSERT INTO role_permissions (role_id, permission_id, granted, status, created_at, updated_at)
SELECT 
    (SELECT id FROM roles WHERE name = 'tenant_admin'),
    p.id,
    1, -- granted
    'active',
    GETUTCDATE(),
    GETUTCDATE()
FROM permissions p
WHERE p.resource = 'rooms'
AND p.id NOT IN (
    SELECT rp.permission_id 
    FROM role_permissions rp 
    INNER JOIN roles r ON rp.role_id = r.id 
    WHERE r.name = 'tenant_admin' 
    AND rp.permission_id = p.id
    AND rp.granted = 1 
    AND rp.status = 'active'
);

-- Ensure tenant_admin has dashboard access
INSERT INTO role_permissions (role_id, permission_id, granted, status, created_at, updated_at)
SELECT 
    (SELECT id FROM roles WHERE name = 'tenant_admin'),
    p.id,
    1, -- granted
    'active',
    GETUTCDATE(),
    GETUTCDATE()
FROM permissions p
WHERE p.permission_key = 'view_dashboard'
AND p.id NOT IN (
    SELECT rp.permission_id 
    FROM role_permissions rp 
    INNER JOIN roles r ON rp.role_id = r.id 
    WHERE r.name = 'tenant_admin' 
    AND rp.permission_id = p.id
    AND rp.granted = 1 
    AND rp.status = 'active'
);

-- Ensure tenant_admin has bookings access
INSERT INTO role_permissions (role_id, permission_id, granted, status, created_at, updated_at)
SELECT 
    (SELECT id FROM roles WHERE name = 'tenant_admin'),
    p.id,
    1, -- granted
    'active',
    GETUTCDATE(),
    GETUTCDATE()
FROM permissions p
WHERE p.resource = 'bookings'
AND p.id NOT IN (
    SELECT rp.permission_id 
    FROM role_permissions rp 
    INNER JOIN roles r ON rp.role_id = r.id 
    WHERE r.name = 'tenant_admin' 
    AND rp.permission_id = p.id
    AND rp.granted = 1 
    AND rp.status = 'active'
);

-- Ensure tenant_admin has guests access
INSERT INTO role_permissions (role_id, permission_id, granted, status, created_at, updated_at)
SELECT 
    (SELECT id FROM roles WHERE name = 'tenant_admin'),
    p.id,
    1, -- granted
    'active',
    GETUTCDATE(),
    GETUTCDATE()
FROM permissions p
WHERE p.resource = 'guests'
AND p.id NOT IN (
    SELECT rp.permission_id 
    FROM role_permissions rp 
    INNER JOIN roles r ON rp.role_id = r.id 
    WHERE r.name = 'tenant_admin' 
    AND rp.permission_id = p.id
    AND rp.granted = 1 
    AND rp.status = 'active'
);

-- Verify the fix
SELECT 
    r.name as role_name,
    r.display_name,
    COUNT(rp.permission_id) as total_permissions,
    STRING_AGG(p.permission_key, ', ') as permissions
FROM roles r
INNER JOIN role_permissions rp ON r.id = rp.role_id
INNER JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'tenant_admin' 
AND rp.granted = 1 
AND rp.status = 'active'
GROUP BY r.name, r.display_name;

-- Check specific resource permissions for tenant_admin
SELECT 
    p.resource,
    COUNT(*) as permission_count,
    STRING_AGG(p.permission_key, ', ') as permissions
FROM roles r
INNER JOIN role_permissions rp ON r.id = rp.role_id
INNER JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'tenant_admin' 
AND rp.granted = 1 
AND rp.status = 'active'
GROUP BY p.resource
ORDER BY p.resource;

-- Update menu permissions to ensure tenant_admin can see tenant-specific menus
-- Make sure tenant_rooms menu is active and accessible
UPDATE menu_permissions 
SET is_active = 1, status = 'active'
WHERE menu_key = 'tenant_rooms';

-- Make sure tenant_bookings menu is active and accessible
UPDATE menu_permissions 
SET is_active = 1, status = 'active'
WHERE menu_key = 'tenant_bookings';

-- Make sure tenant_guests menu is active and accessible
UPDATE menu_permissions 
SET is_active = 1, status = 'active'
WHERE menu_key = 'tenant_guests';

-- Make sure tenant_dashboard menu is active and accessible
UPDATE menu_permissions 
SET is_active = 1, status = 'active'
WHERE menu_key = 'tenant_dashboard';

-- Final verification - Check what menus tenant_admin should be able to see
SELECT DISTINCT
    mp.menu_key,
    mp.menu_name,
    mp.route,
    mp.permission_ids,
    mp.is_active,
    mp.status
FROM menu_permissions mp
WHERE mp.menu_key LIKE 'tenant_%'
   OR mp.menu_key IN ('dashboard', 'bookings', 'rooms', 'guests')
AND mp.is_active = 1
AND mp.status = 'active'
ORDER BY mp.display_order;

PRINT 'Tenant admin access fix completed successfully!';
PRINT 'Tenant admin should now have access to rooms, bookings, guests, and dashboard.';
PRINT 'Check the results above to verify permissions were assigned correctly.';
