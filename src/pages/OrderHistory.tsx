import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, ShoppingBag, ChevronRight } from 'lucide-react';
import { orderApi } from '../lib/api';

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500',
  PAYMENT_INITIATED: 'bg-blue-500/10 text-blue-500',
  PAID: 'bg-green-500/10 text-green-500',
  PROCESSING: 'bg-blue-500/10 text-blue-500',
  SHIPPED: 'bg-purple-500/10 text-purple-500',
  DELIVERED: 'bg-green-500/10 text-green-500',
  CANCELLED: 'bg-red-500/10 text-red-500',
  REFUNDED: 'bg-orange-500/10 text-orange-500',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  PAYMENT_INITIATED: 'Payment Initiated',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export default function OrderHistory() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      const data = await orderApi.getAll();
      setOrders(data.orders);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Package className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tighter">
              My Orders
            </h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-secondary/10 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-display uppercase tracking-tight">No Orders Yet</h2>
                <p className="text-sm text-muted-foreground">
                  You haven't placed any orders yet. Start shopping to see your orders here.
                </p>
              </div>
              <Button onClick={() => navigate('/shop')} className="uppercase tracking-wider">
                Explore Collections
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} to={`/orders/${order.orderNumber}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4">
                          <h3 className="text-lg font-display uppercase tracking-tight">
                            {order.orderNumber}
                          </h3>
                          <Badge
                            className={`uppercase text-[10px] tracking-wider ${
                              statusColors[order.status] || 'bg-secondary/10 text-muted-foreground'
                            }`}
                          >
                            {statusLabels[order.status] || order.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wider">Placed on:</span>
                            <span>{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wider">Items:</span>
                            <span>{order.itemCount}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-wider text-muted-foreground">
                            Total:
                          </span>
                          <span className="text-xl font-display text-primary">
                            ₹{Number(order.total).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
