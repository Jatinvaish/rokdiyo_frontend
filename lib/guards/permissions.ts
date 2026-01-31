import { NextResponse } from 'next/server'

// API Route handler with permission checking
export async function GET(request: Request) {
  try {
    // Check if user has required permissions
    const hasPermission = await checkPermissions(['bookings.read'])
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Your API logic here
    const data = await fetchBookings()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check if user has required permissions
    const hasPermission = await checkPermissions(['bookings.create'])
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    // Your API logic here
    const data = await createBooking(body)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to check permissions on server side
export async function checkPermissions(requiredPermissions: string[]): Promise<boolean> {
  const session = await getServerSession()
  if (!session) {
    return false
  }

  try {
    // Get user's effective permissions
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/access-control/effective-permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(session as any).accessToken}`
      }
    })

    if (!response.ok) {
      return false
    }

    const userPermissions = await response.json()
    const userPermissionKeys = userPermissions.map((p: any) => p.permission_key)

    // Check if user has all required permissions
    return requiredPermissions.every(permission => 
      userPermissionKeys.includes(permission)
    )
  } catch (error) {
    console.error('Permission check failed:', error)
    return false
  }
}

// Example usage in API routes
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check multiple permissions
    const hasPermission = await checkPermissions(['bookings.update', 'bookings.read'])
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { id } = params
    
    // Your update logic here
    const data = await updateBooking(parseInt(id), body)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check single permission
    const hasPermission = await checkPermissions(['bookings.delete'])
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = params
    
    // Your delete logic here
    await deleteBooking(parseInt(id))
    return NextResponse.json({ message: 'Booking deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Mock session function - replace with your actual implementation
async function getServerSession() {
  // Implement your session retrieval logic
  return null
}

// Mock functions - replace with your actual implementations
async function fetchBookings() {
  // Implement your booking fetching logic
  return []
}

async function createBooking(data: any) {
  // Implement your booking creation logic
  return {}
}

async function updateBooking(id: number, data: any) {
  // Implement your booking update logic
  return {}
}

async function deleteBooking(id: number) {
  // Implement your booking deletion logic
}
