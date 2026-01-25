'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { dashboardApi } from '@/lib/api/hotel';
import { DashboardStats, Hotel } from '@/lib/types/hotel';
import { Building2, Bed, Users, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [branches, setBranches] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, branchesData] = await Promise.all([
        dashboardApi.overview(),
        dashboardApi.branchesSummary(),
      ]);
      setStats(statsData);
      setBranches(branchesData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Rooms</p>
              <p className="text-lg font-semibold">{stats?.total_rooms || 0}</p>
            </div>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Occupied</p>
              <p className="text-lg font-semibold">{stats?.occupied_rooms || 0}</p>
              <p className="text-xs text-muted-foreground">{stats?.available_rooms || 0} available</p>
            </div>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Check-ins</p>
              <p className="text-lg font-semibold">{stats?.todays_checkins || 0}</p>
              <p className="text-xs text-muted-foreground">{stats?.todays_checkouts || 0} check-outs</p>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-lg font-semibold">${stats?.todays_revenue || 0}</p>
            </div>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Branches</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {branches.map((branch: any) => (
              <div key={branch.id} className="flex items-center justify-between p-2 border rounded text-sm">
                <div className="flex items-center space-x-2">
                  <div>
                    <p className="font-medium">{branch.name}</p>
                    {branch.is_headquarters && <Badge variant="secondary" className="text-xs">HQ</Badge>}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="text-center">
                    <div className="font-medium">{branch.total_rooms}</div>
                    <div className="text-muted-foreground">Rooms</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{branch.occupied_rooms}</div>
                    <div className="text-muted-foreground">Occupied</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{branch.occupancy_percentage}%</div>
                    <div className="text-muted-foreground">Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">${branch.todays_revenue}</div>
                    <div className="text-muted-foreground">Revenue</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}