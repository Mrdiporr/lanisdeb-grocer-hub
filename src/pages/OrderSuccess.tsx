import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";

interface OrderData {
  orderNumber: string;
  total: number;
  paymentMethod: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state as OrderData;

  useEffect(() => {
    if (!orderData) {
      navigate('/shop');
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Order Confirmed - Lanisdeb Market"
        description="Your order has been successfully placed"
      />
      
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-center py-4">
          <a href="/" className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/78d15118-e2f7-4ec1-92df-3aabde77ded8.png" 
              alt="Lanisdeb Market" 
              className="h-8 w-auto" 
            />
            <span className="font-semibold">Lanisdeb Market</span>
          </a>
        </div>
      </header>

      <main className="container mx-auto py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We'll prepare it for delivery.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order #{orderData.orderNumber}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold text-left">Order Items</h3>
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="text-left">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>${orderData.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-secondary/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-5 w-5" />
                  <span className="font-medium">Payment Method</span>
                </div>
                <p className="text-sm">
                  {orderData.paymentMethod === 'cod' 
                    ? 'Pay on Delivery - You will pay when your order arrives'
                    : 'Credit Card - Payment processed'
                  }
                </p>
              </div>

              {/* Delivery Info */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What's Next?</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• We'll contact you to confirm delivery time</p>
                  <p>• Your order will be prepared fresh</p>
                  <p>• Delivery typically within 1-2 business days</p>
                  {orderData.paymentMethod === 'cod' && (
                    <p>• Have cash ready for payment on delivery</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/shop')}>
                Continue Shopping
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Questions about your order? Contact us at (555) 123-4567
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}