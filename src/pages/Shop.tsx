import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { mockCategories, mockProducts } from "@/lib/mockData";
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

interface Category {
  id: string;
  name: string;
  description?: string;
}

export default function Shop() {
  const navigate = useNavigate();
  const { addItem, state } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (isSupabaseConfigured()) {
        // Fetch from Supabase
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        const { data: productsData } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(name)
          `)
          .eq('is_active', true)
          .order('name');

        setCategories(categoriesData || []);
        setProducts(productsData || []);
      } else {
        // Use mock data for development
        setCategories(mockCategories);
        setProducts(mockProducts);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data on error
      setCategories(mockCategories);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    if (product.stock_quantity === 0) {
      toast({
        title: "Out of stock",
        description: "This item is currently out of stock",
        variant: "destructive"
      });
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity
    });

    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`
    });
  };

  const AppSidebar = () => (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={selectedCategory === "all"}
                  onClick={() => setSelectedCategory("all")}
                >
                  All Products
                  <Badge variant="secondary" className="ml-auto">
                    {products.length}
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {categories.map((category) => {
                const count = products.filter(p => p.category_id === category.id).length;
                return (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton
                      isActive={selectedCategory === category.id}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                      <Badge variant="secondary" className="ml-auto">
                        {count}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full">
        <SEO 
          title="Shop - Lanisdeb African & Caribbean Market" 
          description="Browse our full selection of authentic African & Caribbean groceries, fresh produce, and specialty items." 
          canonical="https://lanisdebmarket.com/shop" 
        />
        
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <a href="/" className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/78d15118-e2f7-4ec1-92df-3aabde77ded8.png" 
                  alt="Lanisdeb Market" 
                  className="h-8 w-auto" 
                />
                <span className="font-semibold hidden sm:block">Lanisdeb Market</span>
              </a>
            </div>
            
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/cart')}>
                Cart ({state.itemCount})
              </Button>
              <Button variant="hero" size="sm">Sign In</Button>
            </div>
          </div>
        </header>

        <div className="flex">
          <AppSidebar />
          
          <main className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">
                {selectedCategory === "all" 
                  ? "All Products" 
                  : categories.find(c => c.id === selectedCategory)?.name
                }
              </h1>
              <p className="text-muted-foreground">
                {searchQuery ? (
                  <>Showing {filteredProducts.length} results for "{searchQuery}"</>
                ) : (
                  <>Showing {filteredProducts.length} products</>
                )}
              </p>
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-md mb-4" />
                      <div className="h-4 bg-muted rounded mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Try adjusting your search or browse all categories"
                    : "This category doesn't have any products yet"
                  }
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group hover:shadow-elevate transition-all duration-300">
                    <CardContent className="p-4">
                      <div 
                        className="aspect-square w-full rounded-md bg-gradient-to-br from-primary/10 to-accent/10 mb-4 overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 
                          className="font-medium group-hover:text-primary transition-colors line-clamp-2 cursor-pointer"
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          {product.name}
                        </h3>
                        
                        {product.category?.name && (
                          <Badge variant="secondary" className="text-xs">
                            {product.category.name}
                          </Badge>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.stock_quantity !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1" 
                            size="sm"
                            disabled={product.stock_quantity === 0}
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/product/${product.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}