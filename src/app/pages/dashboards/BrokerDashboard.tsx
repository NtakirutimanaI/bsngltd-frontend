import { useEffect, useState } from "react";
import { Home, DollarSign, TrendingUp, Users } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { brokerageService, propertyService } from "../../services/dashboardApi";

export default function BrokerDashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [transactionsRes, propertiesRes] = await Promise.all([
        brokerageService.getTransactions(),
        propertyService.getAll(),
      ]);

      if (transactionsRes.success) setTransactions(transactionsRes.data || []);
      if (propertiesRes.success) setProperties(propertiesRes.data?.filter(p => p.status === "available") || []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Broker Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Broker Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalCommission = transactions.reduce((sum, t) => sum + (t.commissionAmount || 0), 0);
  const thisMonthCommission = totalCommission;

  return (
    <DashboardLayout title="Broker Dashboard">
      <div className="space-y-2">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-3 pb-3 px-3">
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--success)' }}>
                {(thisMonthCommission / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Commission</p>
              <p className="text-xs text-slate-600 mt-1">{transactions.length} deals</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-3 pb-3 px-3">
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--success)' }}>{properties.length}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Properties</p>
              <p className="text-xs text-slate-600 mt-1">Available</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-3 pb-3 px-3">
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--success)' }}>{transactions.length}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Deals</p>
              <p className="text-xs text-slate-600 mt-1">Completed</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-3 pb-3 px-3">
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--success)' }}>12</p>
              <p className="text-xs font-medium" style={{ color: 'var(--primary)' }}>Clients</p>
              <p className="text-xs text-slate-600 mt-1">Active</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions and Properties - 2 columns */}
        <div className="grid md:grid-cols-2 gap-3">
          {/* Recent Transactions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {transactions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="text-xs py-1.5 border-b last:border-b-0">
                      <div className="flex items-center justify-between mb-1">
                        <p style={{ color: 'var(--primary)' }} className="font-medium">
                          {transaction.transactionType}
                        </p>
                        <Badge className="h-4 py-0 text-xs" style={{ backgroundColor: '#10b981', color: 'white' }}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>ID: {transaction.propertyId}</span>
                        <span className="font-medium text-green-600">
                          RWF {(transaction.commissionAmount / 1000000).toFixed(2)}M
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Properties */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Available Properties</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {properties.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">No properties</p>
              ) : (
                <div className="space-y-2">
                  {properties.slice(0, 3).map((property) => (
                    <div key={property.id} className="text-xs py-1.5 border-b last:border-b-0">
                      <div className="flex items-center justify-between mb-1">
                        <p style={{ color: 'var(--primary)' }} className="font-medium truncate">{property.title}</p>
                        <Badge className="h-4 py-0 text-xs" variant="success">
                          3%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>{property.location}</span>
                        <span className="font-medium text-green-600">
                          RWF {(property.price / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Summary</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-2 bg-slate-50 rounded">
                <p className="text-slate-600 mb-1">Total Deals</p>
                <p style={{ color: 'var(--success)' }} className="font-bold">{transactions.length}</p>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <p className="text-slate-600 mb-1">Total Commission</p>
                <p style={{ color: 'var(--success)' }} className="font-bold">RWF {(thisMonthCommission / 1000000).toFixed(1)}M</p>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <p className="text-slate-600 mb-1">Avg Commission</p>
                <p style={{ color: 'var(--success)' }} className="font-bold">
                  {transactions.length > 0
                    ? `RWF ${(thisMonthCommission / transactions.length / 1000000).toFixed(2)}M`
                    : "N/A"
                  }
                </p>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <p className="text-slate-600 mb-1">Available</p>
                <p style={{ color: 'var(--success)' }} className="font-bold">{properties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
