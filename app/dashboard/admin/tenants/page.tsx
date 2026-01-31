'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tenantService } from '@/lib/services/tenant.service';
import { Tenant } from '@/lib/types/tenant';
import { AddTenantModal } from '@/components/tenant/add-tenant-modal';
import DynamicSummaryCard, { SummaryCardData } from '@/components/dynamicSummaryCard';
import { Search, Plus } from 'lucide-react';
import { CommonLoading } from '@/components/ui/common-loading';
import { RouteGuard } from '@/components/guards/route-guard';
import { PermissionGuard } from '@/hooks/usePermissions';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(tenants.length === 0);
    try {
      const result = await tenantService.getTenants(1, 100, searchQuery, filterActive);
      setTenants((result.data || []) as any);
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTenants();
  };

  const activeCount = tenants.filter((t) => t.is_active).length;
  const inactiveCount = tenants.filter((t) => !t.is_active).length;

  const statCards: SummaryCardData[] = [
    {
      title: 'Total Tenants',
      value: tenants.length,
      changeValue: 0,
      icon: 'shoppingCart',
      bgColor: 'indigo',
      suffix: ' tenants',
    },
    {
      title: 'Active',
      value: activeCount,
      changeValue: Math.round((activeCount / (tenants.length || 1)) * 100),
      icon: 'checkCircle',
      bgColor: 'green',
      changeLabel: '%',
    },
    {
      title: 'Inactive',
      value: inactiveCount,
      changeValue: Math.round((inactiveCount / (tenants.length || 1)) * 100),
      icon: 'clock',
      bgColor: 'orange',
      changeLabel: '%',
    },
  ];

  if (loading) {
    return <CommonLoading message="Fetching Tenants..." />;
  }

  return (
    <RouteGuard permission="tenants.read">
      <div className="space-y-4 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tenants</h1>
          <PermissionGuard permission="tenants.create">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Tenant
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        {tenants.length > 0 && <DynamicSummaryCard cards={statCards} />}

        {/* Search & Filter */}
        <Card>
          <CardContent className="pt-3 px-4 pb-3">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs font-medium block mb-1">Search</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="h-8 text-sm"
                  />
                  <Button
                    onClick={handleSearch}
                    size="sm"
                    className="h-8 text-xs px-3"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant={filterActive === undefined ? 'default' : 'outline'}
                  onClick={() => setFilterActive(undefined)}
                  size="sm"
                  className="h-8 text-xs"
                >
                  All
                </Button>
                <Button
                  variant={filterActive === true ? 'default' : 'outline'}
                  onClick={() => setFilterActive(true)}
                  size="sm"
                  className="h-8 text-xs"
                >
                  Active
                </Button>
                <Button
                  variant={filterActive === false ? 'default' : 'outline'}
                  onClick={() => setFilterActive(false)}
                  size="sm"
                  className="h-8 text-xs"
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenants List */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Loading tenants...</p>
          </div>
        ) : tenants.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No tenants found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tenants.map((tenant) => (
              <Card key={tenant.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{tenant.name}</h3>
                      <p className="text-muted-foreground">{tenant.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {tenant.admin_name}
                        </Badge>
                        <Badge variant="outline">
                          {tenant.city || 'No location'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={tenant.is_active ? "default" : "secondary"}
                        className="h-5 text-xs"
                      >
                        {tenant.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <PermissionGuard permission="tenants.update">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard permission="tenants.delete">
                        <Button variant="ghost" size="sm">
                          Delete
                        </Button>
                      </PermissionGuard>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Tenant Modal */}
        <AddTenantModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSuccess={loadTenants}
        />
      </div>
    </RouteGuard>
  );
}
