import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Edit, Plus, Upload, CheckCircle, XCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mockCategories, mockProducts } from "@/lib/mockData";

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

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
  is_active: boolean;
  created_at: string;
}

export default function AdminEnhanced() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    price: "",
    description: "",
    stock_quantity: "",
    category_id: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
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
          .order('created_at', { ascending: false });

        setCategories(categoriesData || []);
        setProducts(productsData || []);
        
        if (categoriesData && categoriesData.length > 0 && !selectedCategory) {
          setSelectedCategory(categoriesData[0].id);
          setProductForm(prev => ({ ...prev, category_id: categoriesData[0].id }));
        }
      } else {
        // Use mock data for development
        setCategories(mockCategories);
        setProducts(mockProducts);
        setSelectedCategory(mockCategories[0].id);
        setProductForm(prev => ({ ...prev, category_id: mockCategories[0].id }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data
      setCategories(mockCategories);
      setProducts(mockProducts);
      setSelectedCategory(mockCategories[0].id);
      setProductForm(prev => ({ ...prev, category_id: mockCategories[0].id }));
      
      if (isSupabaseConfigured()) {
        toast({
          title: "Error",
          description: "Failed to fetch data from database, using mock data",
          variant: "destructive"
        });
      }
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setUploadedImages(prev => [...prev, ...uploadedUrls]);
      toast({
        title: "Success",
        description: `${uploadedUrls.length} images uploaded successfully`
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    if (!newCategoryName.trim()) return;

    if (!isSupabaseConfigured()) {
      toast({
        title: "Demo Mode",
        description: "Connect Supabase to save categories",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim() }])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      setNewCategoryName("");
      toast({
        title: "Success",
        description: "Category created successfully"
      });
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      });
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => prev.filter(c => c.id !== categoryId));
      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const createProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!isSupabaseConfigured()) {
      toast({
        title: "Demo Mode",
        description: "Connect Supabase to save products",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const productData = {
        name: productForm.name,
        sku: productForm.sku || null,
        price: parseFloat(productForm.price),
        description: productForm.description || null,
        category_id: productForm.category_id,
        stock_quantity: productForm.stock_quantity ? parseInt(productForm.stock_quantity) : null,
        image_url: uploadedImages[0] || null,
        is_active: true
      };

      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) throw error;

      // Reset form
      setProductForm({
        name: "",
        sku: "",
        price: "",
        description: "",
        stock_quantity: "",
        category_id: categories[0]?.id || ""
      });
      setUploadedImages([]);

      fetchData();
      toast({
        title: "Success",
        description: "Product created successfully"
      });
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== productId));
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, is_active: !currentStatus } : p
      ));
      
      toast({
        title: "Success",
        description: `Product ${!currentStatus ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive"
      });
    }
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(product.id);
    setEditForm({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
      sku: product.sku || "",
      stock_quantity: product.stock_quantity?.toString() || ""
    });
  };

  const saveProductEdit = async (productId: string) => {
    if (!isSupabaseConfigured()) {
      toast({
        title: "Demo Mode",
        description: "Connect Supabase to save changes",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editForm.name,
          price: parseFloat(editForm.price),
          description: editForm.description || null,
          sku: editForm.sku || null,
          stock_quantity: editForm.stock_quantity ? parseInt(editForm.stock_quantity) : null
        })
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.map(p => 
        p.id === productId ? { 
          ...p, 
          name: editForm.name,
          price: parseFloat(editForm.price),
          description: editForm.description,
          sku: editForm.sku,
          stock_quantity: editForm.stock_quantity ? parseInt(editForm.stock_quantity) : 0
        } : p
      ));
      
      setEditingProduct(null);
      setEditForm({});
      
      toast({
        title: "Success",
        description: "Product updated successfully"
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category.id);
    setEditForm({ name: category.name });
  };

  const saveCategoryEdit = async (categoryId: string) => {
    if (!isSupabaseConfigured()) {
      toast({
        title: "Demo Mode",
        description: "Connect Supabase to save changes",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .update({ name: editForm.name })
        .eq('id', categoryId);

      if (error) throw error;

      setCategories(prev => prev.map(c => 
        c.id === categoryId ? { ...c, name: editForm.name } : c
      ));
      
      setEditingCategory(null);
      setEditForm({});
      
      toast({
        title: "Success",
        description: "Category updated successfully"
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title="Admin Dashboard | Lanisdeb Market" 
        description="Manage products, categories, and inventory for Lanisdeb African & Caribbean Market." 
        canonical="https://lanisdebmarket.com/admin" 
      />
      
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between py-6">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <a href="/shop">View Shop</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/">Back to Site</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">Total Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {products.filter(p => p.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">Active Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {products.filter(p => p.stock_quantity === 0).length}
              </div>
              <p className="text-xs text-muted-foreground">Out of Stock</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="add-product">Add Product</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>View and manage all products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="p-4 border rounded-lg">
                      {editingProduct === product.id ? (
                        <div className="space-y-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium">Name</label>
                              <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Price</label>
                              <Input
                                type="number"
                                step="0.01"
                                value={editForm.price}
                                onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">SKU</label>
                              <Input
                                value={editForm.sku}
                                onChange={(e) => setEditForm(prev => ({ ...prev, sku: e.target.value }))}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Stock</label>
                              <Input
                                type="number"
                                value={editForm.stock_quantity}
                                onChange={(e) => setEditForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setEditingProduct(null)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={() => saveProductEdit(product.id)}>
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {product.image_url && (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                            )}
                            <div>
                              <h3 className="font-medium">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                ${product.price.toFixed(2)} • {product.category?.name}
                              </p>
                              <div className="flex gap-2 mt-1">
                                <Badge variant={product.is_active ? "default" : "secondary"}>
                                  {product.is_active ? "Active" : "Inactive"}
                                </Badge>
                                {product.stock_quantity === 0 && (
                                  <Badge variant="destructive">Out of Stock</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleProductStatus(product.id, product.is_active)}
                            >
                              {product.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => startEditProduct(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-product">
            <Card>
              <CardHeader>
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>Create a new product listing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Name *</label>
                    <Input
                      placeholder="e.g., Yellow Plantain"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">SKU</label>
                    <Input
                      placeholder="e.g., LAN-PLT-001"
                      value={productForm.sku}
                      onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price (USD) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g., 1.99"
                      value={productForm.price}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stock Quantity</label>
                    <Input
                      type="number"
                      placeholder="e.g., 50"
                      value={productForm.stock_quantity}
                      onChange={(e) => setProductForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category *</label>
                    <Select 
                      value={productForm.category_id} 
                      onValueChange={(value) => setProductForm(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Product description..."
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Images</label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e.target.files)}
                    disabled={loading}
                  />
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {uploadedImages.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="aspect-square object-cover rounded-md border"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" disabled={loading}>
                    Save as Draft
                  </Button>
                  <Button onClick={createProduct} disabled={loading}>
                    {loading ? "Creating..." : "Create Product"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Category Management</CardTitle>
                <CardDescription>Manage product categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="New category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Button onClick={createCategory} disabled={!newCategoryName.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {categories.map((category) => {
                    const productCount = products.filter(p => p.category_id === category.id).length;
                    return (
                      <div key={category.id} className="p-3 border rounded-lg">
                        {editingCategory === category.id ? (
                          <div className="flex gap-2 items-center">
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              className="flex-1"
                            />
                            <Button variant="outline" size="sm" onClick={() => setEditingCategory(null)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={() => saveCategoryEdit(category.id)}>
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{category.name}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({productCount} products)
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => startEditCategory(category)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => deleteCategory(category.id)}
                                disabled={productCount > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk-upload">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Image Upload</CardTitle>
                <CardDescription>Upload multiple product images at once</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e.target.files)}
                    disabled={loading}
                  />
                  <p className="text-sm text-muted-foreground">
                    Select multiple images to upload to your product gallery
                  </p>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Bulk upload ${index + 1}`}
                          className="aspect-square object-cover rounded-md border"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Alert>
                  <Upload className="h-4 w-4" />
                  <AlertDescription>
                    Images are uploaded to Supabase Storage and can be used when creating products.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}