import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { mockProducts } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category_id: string;
  category?: { name: string };
  image_url?: string;
  sku?: string;
  stock_quantity?: number;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, state } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) {
      navigate('/shop');
      return;
    }
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name)
          `)
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        setProduct(data);
      } else {
        // Use mock data
        const mockProduct = mockProducts.find(p => p.id === id);
        if (mockProduct) {
          setProduct(mockProduct);
        } else {
          throw new Error('Product not found');
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive"
      });
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = state.items.find(item => item.id === product.id);
    const currentQuantity = cartItem?.quantity || 0;
    const maxQuantity = product.stock_quantity || Infinity;

    if (currentQuantity + quantity > maxQuantity) {
      toast({
        title: "Not enough stock",
        description: `Only ${maxQuantity - currentQuantity} more items available`,
        variant: "destructive"
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity
      });
    }

    toast({
      title: "Added to cart",
      description: `${quantity} ${product.name} added to your cart`
    });
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    const maxQuantity = product?.stock_quantity || Infinity;
    
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between py-4">
            <Button variant="ghost" onClick={() => navigate('/shop')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
          </div>
        </header>
        
        <div className="container mx-auto py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted animate-pulse rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-6 bg-muted animate-pulse rounded w-1/4" />
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <SEO 
        title={`${product.name} - Lanisdeb Market`}
        description={product.description || `Buy ${product.name} at Lanisdeb African & Caribbean Market`}
      />
      
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          <Button variant="ghost" onClick={() => navigate('/shop')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
          
          <a href="/" className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/78d15118-e2f7-4ec1-92df-3aabde77ded8.png" 
              alt="Lanisdeb Market" 
              className="h-8 w-auto" 
            />
            <span className="font-semibold hidden sm:block">Lanisdeb Market</span>
          </a>
          
          <Button variant="outline" onClick={() => navigate('/cart')}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart ({state.itemCount})
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.category?.name && (
                <Badge variant="secondary" className="mb-4">
                  {product.category.name}
                </Badge>
              )}
              {product.sku && (
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
              )}
            </div>

            <div className="text-3xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Stock Status */}
            <div>
              {product.stock_quantity !== undefined && (
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={product.stock_quantity > 0 ? "default" : "destructive"}
                  >
                    {product.stock_quantity > 0 
                      ? `${product.stock_quantity} in stock` 
                      : 'Out of stock'
                    }
                  </Badge>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock_quantity !== 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Quantity</label>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-4 py-2 border rounded-md min-w-[60px] text-center">
                          {quantity}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= (product.stock_quantity || Infinity)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total:</span>
                      <span className="text-xl font-bold text-primary">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                    </div>

                    <Button 
                      onClick={handleAddToCart}
                      className="w-full"
                      size="lg"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}