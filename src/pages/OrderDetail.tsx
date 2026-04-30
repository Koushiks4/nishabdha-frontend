import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, MapPin, ArrowLeft, Truck, CheckCircle } from 'lucide-react';
import { orderApi } from '../lib/api';

interface OrderItem {
  id: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  variant: {
    product: {
      images: Array<{ url: string }>;
    };
  };
}

interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  paymentMethod: string;
  items: OrderItem[];
  address: Address;
  createdAt: string;
  paidAt?: string;
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

export default function OrderDetail() {
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
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderTimeline = (order: Order) => {
    const timeline = [
      {
        label: 'Order Placed',
        date: order.createdAt,
        completed: true,
      },
      {
        label: 'Payment Confirmed',
        date: order.paidAt || null,
        completed: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
      },
      {
        label: 'Processing',
        date: null,
        completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status),
      },
      {
        label: 'Shipped',
        date: null,
        completed: ['SHIPPED', 'DELIVERED'].includes(order.status),
      },
      {
        label: 'Delivered',
        date: null,
        completed: order.status === 'DELIVERED',
      },
    ];

    return timeline;
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
              <p className="text-sm text-muted-foreground">{error || 'We could not find this order'}</p>
            </div>
            <Button onClick={() => navigate('/account/orders')} className="w-full">
              View All Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeline = getOrderTimeline(order);

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/account/orders')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight">
                Order {order.orderNumber}
              </h1>
              <p className="text-sm text-muted-foreground">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge
              className={`uppercase text-xs tracking-wider px-4 py-2 ${
                statusColors[order.status] || 'bg-secondary/10 text-muted-foreground'
              }`}
            >
              {statusLabels[order.status] || order.status}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Items & Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl uppercase tracking-wider flex items-center gap-3">
                  <Package className="w-5 h-5 text-primary" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-6">
                    <div className="w-24 h-28 bg-secondary/10 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.variant.product.images[0]?.url || ''}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium uppercase tracking-wide">{item.productName}</h4>
                      <p className="text-sm text-muted-foreground">Variant: {item.variantName}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      <p className="text-lg font-heading text-primary">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl uppercase tracking-wider flex items-center gap-3">
                  <Truck className="w-5 h-5 text-primary" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timeline.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed
                              ? 'bg-primary text-background'
                              : 'bg-secondary/10 text-muted-foreground'
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <div className="w-2 h-2 bg-current rounded-full" />
                          )}
                        </div>
                        {index < timeline.length - 1 && (
                          <div
                            className={`w-0.5 h-12 ${
                              step.completed ? 'bg-primary' : 'bg-secondary/10'
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <h4
                          className={`text-sm font-medium uppercase tracking-wide ${
                            step.completed ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </h4>
                        {step.date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(step.date)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary & Address */}
          <div className="space-y-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl uppercase tracking-wider">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-wider">Subtotal</span>
                  <span>₹{Number(order.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-wider">Shipping</span>
                  <span>
                    {Number(order.shippingCost) === 0
                      ? 'FREE'
                      : `₹${Number(order.shippingCost).toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground uppercase tracking-wider">Tax</span>
                  <span>₹{Number(order.tax).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-display">
                  <span className="uppercase tracking-wide">Total</span>
                  <span className="text-primary">₹{Number(order.total).toLocaleString()}</span>
                </div>
                <div className="pt-4 text-xs text-muted-foreground space-y-1">
                  <p className="uppercase tracking-wider">Payment Method</p>
                  <p className="capitalize">{order.paymentMethod}</p>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl uppercase tracking-wider flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{order.address.fullName}</p>
                <p className="text-muted-foreground">{order.address.addressLine1}</p>
                {order.address.addressLine2 && (
                  <p className="text-muted-foreground">{order.address.addressLine2}</p>
                )}
                <p className="text-muted-foreground">
                  {order.address.city}, {order.address.state} - {order.address.postalCode}
                </p>
                <p className="text-muted-foreground pt-2">Phone: {order.address.phone}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
