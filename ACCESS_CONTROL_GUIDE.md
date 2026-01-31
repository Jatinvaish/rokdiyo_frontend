# Access Control Implementation Guide

## 📋 **Overview**

This guide explains how the access control system works in the Rokdio Hotel Management system and how to prevent specific roles from accessing routes, menus, and buttons.

## 🏗️ **Access Control Architecture**

### **1. Permission System**
- **Permissions**: Granular permissions like `roles.read`, `users.create`, `dashboard.read`
- **Roles**: Collections of permissions assigned to users
- **Guards**: React components that check permissions before rendering content

### **2. Key Components**
- `PermissionGuard`: Component to wrap UI elements that require permissions
- `usePermissions`: Hook to check permissions programmatically
- `PermissionButton`: Button with built-in permission checking

## 🛡️ **How to Prevent Role Access**

### **Method 1: Sidebar Menu Protection**

**File**: `components/layout/sidebar/nav-main.tsx`

Each menu item has a `permission` property:

```typescript
{
  title: "Tenant Management", 
  href: "/dashboard/admin/tenants", 
  icon: Shield, 
  permission: "tenants.read"  // This controls access
}
```

**To prevent access to `/dashboard/admin/tenants`:**

1. **Remove the permission** from the role in the database
2. **Or change the permission** required:
   ```typescript
   permission: "tenants.admin"  // Higher level permission
   ```

### **Method 2: Page-Level Protection**

**File**: Any page component (e.g., `app/dashboard/admin/tenants/page.tsx`)

Wrap the entire page with PermissionGuard:

```typescript
export default function TenantsPage() {
  return (
    <PermissionGuard permission="tenants.read">
      {/* Page content */}
    </PermissionGuard>
  );
}
```

### **Method 3: Button-Level Protection**

**Example**: Preventing role creation

```typescript
<PermissionGuard permission="roles.create">
  <Button onClick={() => setCreateModalOpen(true)}>
    Create Role
  </Button>
</PermissionGuard>
```

## 🔄 **Complete Access Control Flow**

### **Step 1: Define Permission**
In your database, create a permission:
```sql
INSERT INTO permissions (permission_key, resource, action, category) 
VALUES ('tenants.read', 'tenants', 'read', 'admin');
```

### **Step 2: Assign to Role**
```sql
INSERT INTO role_permissions (role_id, permission_id) 
VALUES (1, 123); -- role_id 1 = admin, permission_id 123 = tenants.read
```

### **Step 3: Use in Sidebar**
```typescript
// nav-main.tsx
{
  title: "Tenant Management", 
  href: "/dashboard/admin/tenants", 
  icon: Shield, 
  permission: "tenants.read"
}
```

### **Step 4: Protect Page**
```typescript
// app/dashboard/admin/tenants/page.tsx
<PermissionGuard permission="tenants.read">
  <div>Page content here</div>
</PermissionGuard>
```

### **Step 5: Protect Actions**
```typescript
<PermissionGuard permission="tenants.create">
  <Button>Create Tenant</Button>
</PermissionGuard>
```

## 🎯 **Real Example: Preventing Access to Tenant Management**

### **Scenario**: You want to prevent "Manager" role from accessing `/dashboard/admin/tenants`

#### **Option A: Remove Permission from Role**
1. Go to your database
2. Find the "Manager" role (role_id)
3. Remove the `tenants.read` permission:
```sql
DELETE FROM role_permissions 
WHERE role_id = (SELECT id FROM roles WHERE name = 'Manager') 
AND permission_id = (SELECT id FROM permissions WHERE permission_key = 'tenants.read');
```

#### **Option B: Change Required Permission**
1. Change the sidebar to require higher permission:
```typescript
// nav-main.tsx
{
  title: "Tenant Management", 
  href: "/dashboard/admin/tenants", 
  icon: Shield, 
  permission: "tenants.admin"  // Changed from "tenants.read"
}
```

2. Only assign `tenants.admin` to Super Admin role

#### **Option C: Use Super Admin Check**
```typescript
// nav-main.tsx - Only show to super admins
export const adminNavItems: NavGroup[] = [
  {
    title: "Super Admin",
    items: [
      { 
        title: "Tenant Management", 
        href: "/dashboard/admin/tenants", 
        icon: Shield, 
        permission: "tenants.read"  // Only shown to super admins anyway
      },
    ],
  },
];
```

## 🔧 **Permission Keys Reference**

### **Common Permissions**
- `dashboard.read` - View dashboard
- `hotels.read` / `hotels.create` / `hotels.update` / `hotels.delete`
- `rooms.read` / `rooms.create` / `rooms.update` / `rooms.delete`
- `guests.read` / `guests.create` / `guests.update` / `guests.delete`
- `bookings.read` / `bookings.create` / `bookings.update` / `bookings.delete`
- `tenants.read` / `tenants.create` / `tenants.update` / `tenants.delete`
- `roles.read` / `roles.create` / `roles.update` / `roles.delete`
- `permissions.read` / `permissions.create` / `permissions.update` / `permissions.delete`
- `menu_permissions.read` / `menu_permissions.create` / `menu_permissions.update` / `menu_permissions.delete`
- `subscription_plans.read` / `subscription_plans.create` / `subscription_plans.update` / `subscription_plans.delete`

### **Permission Format**
```
{resource}.{action}
```

**Resources**: dashboard, hotels, rooms, guests, bookings, tenants, roles, permissions, menu_permissions, subscription_plans
**Actions**: read, create, update, delete, assign

## 🚀 **Implementation Checklist**

### **To Protect a New Route:**

1. **✅ Add Permission to Sidebar**
   ```typescript
   { title: "New Page", href: "/dashboard/new", permission: "new.read" }
   ```

2. **✅ Protect the Page**
   ```typescript
   <PermissionGuard permission="new.read">
     <NewPage />
   </PermissionGuard>
   ```

3. **✅ Protect Buttons/Actions**
   ```typescript
   <PermissionGuard permission="new.create">
     <Button>Create New</Button>
   </PermissionGuard>
   ```

4. **✅ Create Permission in Database**
   ```sql
   INSERT INTO permissions (permission_key, resource, action, category) 
   VALUES ('new.read', 'new', 'read', 'general');
   ```

5. **✅ Assign to Roles**
   ```sql
   INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 456);
   ```

## 🎨 **UI Components with Guards**

### **PermissionGuard Usage**
```typescript
// Single permission
<PermissionGuard permission="users.read">
  <UsersList />
</PermissionGuard>

// Multiple permissions (user needs ALL)
<PermissionGuard permission={["users.read", "users.update"]}>
  <UserManagement />
</PermissionGuard>

// Fallback content
<PermissionGuard permission="admin.access" fallback={<AccessDenied />}>
  <AdminPanel />
</PermissionGuard>
```

### **usePermissions Hook**
```typescript
const { hasPermission, isSuperAdmin } = usePermissions();

// Programmatic checks
if (hasPermission('users.create')) {
  // Show create button
}

if (isSuperAdmin) {
  // Show super admin features
}
```

## 🔒 **Security Best Practices**

1. **Always protect both UI and API**
2. **Use specific permissions** (e.g., `tenants.admin` vs `tenants.read`)
3. **Implement server-side validation** in all API endpoints
4. **Use tenant/firm/branch restrictions** for multi-tenant security
5. **Regular permission audits** to ensure least privilege

## 📞 **Troubleshooting**

### **Menu Not Showing?**
1. Check if user has the required permission
2. Verify permission exists in database
3. Check role-permission assignment
4. Verify PermissionGuard syntax

### **Access Denied on Page?**
1. Check page-level PermissionGuard
2. Verify user permissions
3. Check API endpoint permissions
4. Verify tenant/firm/branch restrictions

### **Button Not Visible?**
1. Check button-level PermissionGuard
2. Verify permission key spelling
3. Check if permission is assigned to user role

---

**🎯 Remember**: Access control is multi-layered - always protect at the menu, page, and action levels for complete security!
