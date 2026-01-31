import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Mock data based on your database structure
    // In production, this would query your actual database
    const mockPermissions = [
      // Super Admin permissions (user_id: 1)
      ...(user_id === 1 ? [
        { id: 1, permission_key: 'users.create', resource: 'users', action: 'create', description: 'Create new users', category: 'user_management' },
        { id: 2, permission_key: 'users.read', resource: 'users', action: 'read', description: 'View users', category: 'user_management' },
        { id: 3, permission_key: 'users.update', resource: 'users', action: 'update', description: 'Update user details', category: 'user_management' },
        { id: 4, permission_key: 'users.delete', resource: 'users', action: 'delete', description: 'Delete users', category: 'user_management' },
        { id: 5, permission_key: 'tenants.create', resource: 'tenants', action: 'create', description: 'Create new hotel tenants', category: 'tenant_management' },
        { id: 6, permission_key: 'tenants.read', resource: 'tenants', action: 'read', description: 'View hotel tenant details', category: 'tenant_management' },
        { id: 7, permission_key: 'tenants.update', resource: 'tenants', action: 'update', description: 'Update hotel tenant settings', category: 'tenant_management' },
        { id: 8, permission_key: 'roles.manage', resource: 'roles', action: 'manage', description: 'Manage roles and permissions', category: 'access_control' },
        { id: 9, permission_key: 'permissions.view', resource: 'permissions', action: 'read', description: 'View permissions', category: 'access_control' },
        { id: 10, permission_key: 'subscriptions.manage', resource: 'subscriptions', action: 'manage', description: 'Manage subscription plans', category: 'subscription' },
        { id: 11, permission_key: 'subscriptions.view', resource: 'subscriptions', action: 'read', description: 'View subscription details', category: 'subscription' },
        { id: 12, permission_key: 'invitations.send', resource: 'invitations', action: 'create', description: 'Send user invitations', category: 'invitation' },
        { id: 13, permission_key: 'invitations.manage', resource: 'invitations', action: 'manage', description: 'Manage invitations', category: 'invitation' },
        { id: 14, permission_key: 'dashboard.read', resource: 'dashboard', action: 'read', description: 'Access dashboard', category: 'general' },
        { id: 15, permission_key: 'reports.view', resource: 'reports', action: 'read', description: 'View reports', category: 'reporting' },
        { id: 16, permission_key: 'hotels.read', resource: 'hotels', action: 'read', description: 'View hotels and branches', category: 'property' },
        { id: 17, permission_key: 'hotels.create', resource: 'hotels', action: 'create', description: 'Create new hotels', category: 'property' },
        { id: 18, permission_key: 'hotels.update', resource: 'hotels', action: 'update', description: 'Update hotel details', category: 'property' },
        { id: 19, permission_key: 'hotels.delete', resource: 'hotels', action: 'delete', description: 'Delete hotels', category: 'property' },
        { id: 20, permission_key: 'rooms.read', resource: 'rooms', action: 'read', description: 'View rooms', category: 'property' },
        { id: 21, permission_key: 'rooms.create', resource: 'rooms', action: 'create', description: 'Create new rooms', category: 'property' },
        { id: 22, permission_key: 'rooms.update', resource: 'rooms', action: 'update', description: 'Update room details', category: 'property' },
        { id: 23, permission_key: 'rooms.delete', resource: 'rooms', action: 'delete', description: 'Delete rooms', category: 'property' },
        { id: 24, permission_key: 'room_types.read', resource: 'room_types', action: 'read', description: 'View room types', category: 'property' },
        { id: 25, permission_key: 'room_types.create', resource: 'room_types', action: 'create', description: 'Create new room types', category: 'property' },
        { id: 26, permission_key: 'room_types.update', resource: 'room_types', action: 'update', description: 'Update room type details', category: 'property' },
        { id: 27, permission_key: 'room_types.delete', resource: 'room_types', action: 'delete', description: 'Delete room types', category: 'property' },
        { id: 28, permission_key: 'bookings.read', resource: 'bookings', action: 'read', description: 'View bookings', category: 'reservations' },
        { id: 29, permission_key: 'bookings.create', resource: 'bookings', action: 'create', description: 'Create new bookings', category: 'reservations' },
        { id: 30, permission_key: 'bookings.update', resource: 'bookings', action: 'update', description: 'Update booking details', category: 'reservations' },
        { id: 31, permission_key: 'bookings.delete', resource: 'bookings', action: 'delete', description: 'Cancel/delete bookings', category: 'reservations' },
        { id: 32, permission_key: 'guests.read', resource: 'guests', action: 'read', description: 'View guest information', category: 'reservations' },
        { id: 33, permission_key: 'guests.create', resource: 'guests', action: 'create', description: 'Create new guest profiles', category: 'reservations' },
        { id: 34, permission_key: 'guests.update', resource: 'guests', action: 'update', description: 'Update guest details', category: 'reservations' },
        { id: 35, permission_key: 'guests.delete', resource: 'guests', action: 'delete', description: 'Delete guest profiles', category: 'reservations' },
        { id: 36, permission_key: 'invoices.read', resource: 'invoices', action: 'read', description: 'View invoices', category: 'finance' },
        { id: 37, permission_key: 'invoices.create', resource: 'invoices', action: 'create', description: 'Create invoices', category: 'finance' },
        { id: 38, permission_key: 'invoices.update', resource: 'invoices', action: 'update', description: 'Update invoice details', category: 'finance' },
        { id: 39, permission_key: 'invoices.delete', resource: 'invoices', action: 'delete', description: 'Delete invoices', category: 'finance' },
        { id: 40, permission_key: 'payments.read', resource: 'payments', action: 'read', description: 'View payment information', category: 'finance' },
        { id: 41, permission_key: 'payments.create', resource: 'payments', action: 'create', description: 'Record payments', category: 'finance' },
        { id: 42, permission_key: 'payments.update', resource: 'payments', action: 'update', description: 'Update payment details', category: 'finance' },
        { id: 43, permission_key: 'payments.delete', resource: 'payments', action: 'delete', description: 'Delete payment records', category: 'finance' },
        { id: 44, permission_key: 'reports.read', resource: 'reports', action: 'read', description: 'View reports', category: 'analytics' },
        { id: 45, permission_key: 'reports.create', resource: 'reports', action: 'create', description: 'Generate reports', category: 'analytics' },
        { id: 46, permission_key: 'reports.export', resource: 'reports', action: 'export', description: 'Export reports', category: 'analytics' },
        { id: 47, permission_key: 'settings.read', resource: 'settings', action: 'read', description: 'View system settings', category: 'administration' },
        { id: 48, permission_key: 'settings.update', resource: 'settings', action: 'update', description: 'Update system settings', category: 'administration' },
        { id: 49, permission_key: 'roles.create', resource: 'roles', action: 'create', description: 'Create new roles', category: 'access_control' },
        { id: 50, permission_key: 'roles.update', resource: 'roles', action: 'update', description: 'Update role details', category: 'access_control' },
        { id: 51, permission_key: 'roles.delete', resource: 'roles', action: 'delete', description: 'Delete roles', category: 'access_control' },
      ] : []),
      
      // Tenant Admin permissions (user_id: 5, 6)
      ...(user_id === 5 || user_id === 6 ? [
        { id: 1, permission_key: 'users.create', resource: 'users', action: 'create', description: 'Create new users', category: 'user_management' },
        { id: 2, permission_key: 'users.read', resource: 'users', action: 'read', description: 'View users', category: 'user_management' },
        { id: 3, permission_key: 'users.update', resource: 'users', action: 'update', description: 'Update user details', category: 'user_management' },
        { id: 4, permission_key: 'users.delete', resource: 'users', action: 'delete', description: 'Delete users', category: 'user_management' },
        { id: 8, permission_key: 'roles.manage', resource: 'roles', action: 'manage', description: 'Manage roles and permissions', category: 'access_control' },
        { id: 9, permission_key: 'permissions.view', resource: 'permissions', action: 'read', description: 'View permissions', category: 'access_control' },
        { id: 11, permission_key: 'subscriptions.view', resource: 'subscriptions', action: 'read', description: 'View subscription details', category: 'subscription' },
        { id: 12, permission_key: 'invitations.send', resource: 'invitations', action: 'create', description: 'Send user invitations', category: 'invitation' },
        { id: 13, permission_key: 'invitations.manage', resource: 'invitations', action: 'manage', description: 'Manage invitations', category: 'invitation' },
        { id: 14, permission_key: 'dashboard.read', resource: 'dashboard', action: 'read', description: 'Access dashboard', category: 'general' },
        { id: 15, permission_key: 'reports.view', resource: 'reports', action: 'read', description: 'View reports', category: 'reporting' },
        { id: 16, permission_key: 'hotels.read', resource: 'hotels', action: 'read', description: 'View hotels and branches', category: 'property' },
        { id: 17, permission_key: 'hotels.create', resource: 'hotels', action: 'create', description: 'Create new hotels', category: 'property' },
        { id: 18, permission_key: 'hotels.update', resource: 'hotels', action: 'update', description: 'Update hotel details', category: 'property' },
        { id: 19, permission_key: 'hotels.delete', resource: 'hotels', action: 'delete', description: 'Delete hotels', category: 'property' },
        { id: 20, permission_key: 'rooms.read', resource: 'rooms', action: 'read', description: 'View rooms', category: 'property' },
        { id: 21, permission_key: 'rooms.create', resource: 'rooms', action: 'create', description: 'Create new rooms', category: 'property' },
        { id: 22, permission_key: 'rooms.update', resource: 'rooms', action: 'update', description: 'Update room details', category: 'property' },
        { id: 23, permission_key: 'rooms.delete', resource: 'rooms', action: 'delete', description: 'Delete rooms', category: 'property' },
        { id: 24, permission_key: 'room_types.read', resource: 'room_types', action: 'read', description: 'View room types', category: 'property' },
        { id: 25, permission_key: 'room_types.create', resource: 'room_types', action: 'create', description: 'Create new room types', category: 'property' },
        { id: 26, permission_key: 'room_types.update', resource: 'room_types', action: 'update', description: 'Update room type details', category: 'property' },
        { id: 27, permission_key: 'room_types.delete', resource: 'room_types', action: 'delete', description: 'Delete room types', category: 'property' },
        { id: 28, permission_key: 'bookings.read', resource: 'bookings', action: 'read', description: 'View bookings', category: 'reservations' },
        { id: 29, permission_key: 'bookings.create', resource: 'bookings', action: 'create', description: 'Create new bookings', category: 'reservations' },
        { id: 30, permission_key: 'bookings.update', resource: 'bookings', action: 'update', description: 'Update booking details', category: 'reservations' },
        { id: 31, permission_key: 'bookings.delete', resource: 'bookings', action: 'delete', description: 'Cancel/delete bookings', category: 'reservations' },
        { id: 32, permission_key: 'guests.read', resource: 'guests', action: 'read', description: 'View guest information', category: 'reservations' },
        { id: 33, permission_key: 'guests.create', resource: 'guests', action: 'create', description: 'Create new guest profiles', category: 'reservations' },
        { id: 34, permission_key: 'guests.update', resource: 'guests', action: 'update', description: 'Update guest details', category: 'reservations' },
        { id: 35, permission_key: 'guests.delete', resource: 'guests', action: 'delete', description: 'Delete guest profiles', category: 'reservations' },
        { id: 36, permission_key: 'invoices.read', resource: 'invoices', action: 'read', description: 'View invoices', category: 'finance' },
        { id: 37, permission_key: 'invoices.create', resource: 'invoices', action: 'create', description: 'Create invoices', category: 'finance' },
        { id: 38, permission_key: 'invoices.update', resource: 'invoices', action: 'update', description: 'Update invoice details', category: 'finance' },
        { id: 39, permission_key: 'invoices.delete', resource: 'invoices', action: 'delete', description: 'Delete invoices', category: 'finance' },
        { id: 40, permission_key: 'payments.read', resource: 'payments', action: 'read', description: 'View payment information', category: 'finance' },
        { id: 41, permission_key: 'payments.create', resource: 'payments', action: 'create', description: 'Record payments', category: 'finance' },
        { id: 42, permission_key: 'payments.update', resource: 'payments', action: 'update', description: 'Update payment details', category: 'finance' },
        { id: 43, permission_key: 'payments.delete', resource: 'payments', action: 'delete', description: 'Delete payment records', category: 'finance' },
        { id: 44, permission_key: 'reports.read', resource: 'reports', action: 'read', description: 'View reports', category: 'analytics' },
        { id: 45, permission_key: 'reports.create', resource: 'reports', action: 'create', description: 'Generate reports', category: 'analytics' },
        { id: 46, permission_key: 'reports.export', resource: 'reports', action: 'export', description: 'Export reports', category: 'analytics' },
        { id: 47, permission_key: 'settings.read', resource: 'settings', action: 'read', description: 'View system settings', category: 'administration' },
        { id: 48, permission_key: 'settings.update', resource: 'settings', action: 'update', description: 'Update system settings', category: 'administration' },
        { id: 49, permission_key: 'roles.create', resource: 'roles', action: 'create', description: 'Create new roles', category: 'access_control' },
        { id: 50, permission_key: 'roles.update', resource: 'roles', action: 'update', description: 'Update role details', category: 'access_control' },
        { id: 51, permission_key: 'roles.delete', resource: 'roles', action: 'delete', description: 'Delete roles', category: 'access_control' },
      ] : []),
      
      // Tenant User permissions (user_id: 2, 3, 4)
      ...(user_id === 2 || user_id === 3 || user_id === 4 ? [
        { id: 14, permission_key: 'dashboard.read', resource: 'dashboard', action: 'read', description: 'Access dashboard', category: 'general' },
        { id: 28, permission_key: 'bookings.read', resource: 'bookings', action: 'read', description: 'View bookings', category: 'reservations' },
        { id: 29, permission_key: 'bookings.create', resource: 'bookings', action: 'create', description: 'Create new bookings', category: 'reservations' },
        { id: 30, permission_key: 'bookings.update', resource: 'bookings', action: 'update', description: 'Update booking details', category: 'reservations' },
        { id: 32, permission_key: 'guests.read', resource: 'guests', action: 'read', description: 'View guest information', category: 'reservations' },
        { id: 33, permission_key: 'guests.create', resource: 'guests', action: 'create', description: 'Create new guest profiles', category: 'reservations' },
        { id: 34, permission_key: 'guests.update', resource: 'guests', action: 'update', description: 'Update guest details', category: 'reservations' },
        { id: 20, permission_key: 'rooms.read', resource: 'rooms', action: 'read', description: 'View rooms', category: 'property' },
        { id: 24, permission_key: 'room_types.read', resource: 'room_types', action: 'read', description: 'View room types', category: 'property' },
        { id: 40, permission_key: 'payments.read', resource: 'payments', action: 'read', description: 'View payment information', category: 'finance' },
        { id: 41, permission_key: 'payments.create', resource: 'payments', action: 'create', description: 'Record payments', category: 'finance' },
        { id: 2, permission_key: 'users.read', resource: 'users', action: 'read', description: 'View users', category: 'user_management' },
      ] : []),
    ]

    return NextResponse.json(mockPermissions)
  } catch (error) {
    console.error('Error fetching effective permissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
