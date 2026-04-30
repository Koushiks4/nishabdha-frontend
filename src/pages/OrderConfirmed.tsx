import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Loader2, Package, Home } from 'lucide-react';
import { orderApi } from '../lib/api';

interface OrderItem {
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

export default function OrderConfirmed() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (!orderNumber) {
      navigate('/');
      return;
    }

    fetchOrder();
  }, [isAuthenticated, orderNumber, navigate]);

  const fetchOrder = async () => {
    try {
      const data = await orderApi.getByOrderNumber(orderNumber!);
      setOrder(data.order);

      // If order is still pending, try to verify payment
      if (data.order.status === 'PENDING' || data.order.status === 'PAYMENT_INITIATED') {
        try {
          const verificationResult = await orderApi.verifyPayment(orderNumber!);
          if (verificationResult.paymentVerified) {
            // Update local order state with verified order
            setOrder(verificationResult.order);
          }
        } catch (verifyErr) {
          console.error('Failed to verify payment:', verifyErr);
          // Continue showing the order even if verification fails
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-display uppercase tracking-tight">Order Not Found</h1>
              <p className="text-sm text-muted-foreground">
                {error || 'We could not find this order'}
              </p>
            </div>
            <Button onClick={() => navigate('/')} className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = order.status === 'PAID' || order.status === 'PROCESSING';

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center space-y-8">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                isPaid ? 'bg-green-500/10' : 'bg-yellow-500/10'
              }`}>
                <CheckCircle className={`w-12 h-12 ${
                  isPaid ? 'text-green-500' : 'text-yellow-500'
                }`} />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight">
                {isPaid ? 'Order Confirmed!' : 'Payment Pending'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isPaid
                  ? 'Thank you for your purchase. Your order has been confirmed.'
                  : 'Your order has been created. Payment confirmation is pending.'}
              </p>
            </div>

            {/* Order Number */}
            <div className="p-6 bg-secondary/10 rounded-lg space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Order Number
              </p>
              <p className="text-2xl font-display tracking-tight">{order.orderNumber}</p>
            </div>

            {/* Order Items */}
            <div className="space-y-4 pt-6 border-t border-border text-left">
              <h2 className="text-sm uppercase tracking-wider font-display">Order Items</h2>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.variantName} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-heading text-primary">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}

              <div className="flex justify-between items-center pt-4 border-t border-border text-lg font-display">
                <span className="uppercase tracking-wide">Total</span>
                <span>₹{Number(order.total).toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                onClick={() => navigate('/account/orders')}
                variant="outline"
                className="flex-1 uppercase tracking-wider text-xs"
              >
                <Package className="mr-2 h-4 w-4" />
                View All Orders
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="flex-1 uppercase tracking-wider text-xs"
              >
                <Home className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </div>

            {/* Email Notification */}
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              A confirmation email has been sent to your email address
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
