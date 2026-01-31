'use client'

import { ReactNode } from 'react'
import { PermissionsProvider } from '@/hooks/usePermissions'

interface DashboardClientWrapperProps {
  children: ReactNode
}

export function DashboardClientWrapper({ children }: DashboardClientWrapperProps) {
  return (
    <PermissionsProvider>
      {children}
    </PermissionsProvider>
  )
}
