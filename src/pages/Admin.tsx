import { useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

const mockCategories = [
  { id: "produce", name: "Fresh Produce" },
  { id: "pantry", name: "Pantry Staples" },
  { id: "frozen", name: "Frozen" },
  { id: "beverages", name: "Beverages" },
  { id: "snacks", name: "Snacks" },
];

export default function Admin() {
  const [category, setCategory] = useState<string>(mockCategories[0].id);
  const [images, setImages] = useState<string[]>([]);
  const bulkRef = useRef<HTMLInputElement | null>(null);

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Admin | Lanisdeb Market",
  }), []);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls]);
  };

  return (
    <div className="min-h-screen">
      <SEO title="Admin | Lanisdeb Market" description="Manage products, categories, and bulk uploads." canonical="https://lanisdebmarket.com/admin" jsonLd={jsonLd} />
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between py-6">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <a href="/" className="text-sm underline">Back to site</a>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <Tabs defaultValue="products" className="w-full">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Add a new product</CardTitle>
                <CardDescription>Create a product and assign it to a category.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm">Name</label>
                  <Input placeholder="e.g., Yellow Plantain" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">SKU</label>
                  <Input placeholder="e.g., LAN-PLT-001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Price (USD)</label>
                  <Input type="number" step="0.01" placeholder="e.g., 1.99" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm">Description</label>
                  <Textarea placeholder="Write a short description..." rows={4} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm">Upload product images</label>
                  <Input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} />
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                      {images.map((src, i) => (
                        <img key={i} src={src} alt={`Upload preview ${i + 1}`} className="aspect-square w-full object-cover rounded-md border" loading="lazy" />
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 flex justify-end gap-3">
                  <Button variant="outline">Save as Draft</Button>
                  <Button variant="hero">Publish Product</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Manage categories</CardTitle>
                <CardDescription>Create or rename your categories.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input placeholder="New category name" />
                  <Button>Add</Button>
                </div>
                <ul className="grid gap-2 md:grid-cols-2">
                  {mockCategories.map((c) => (
                    <li key={c.id} className="flex items-center justify-between rounded-md border p-3">
                      <span>{c.name}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Rename</Button>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Bulk image upload</CardTitle>
                <CardDescription>Upload multiple product photos at once.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input ref={bulkRef} type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} />
                  <p className="text-sm text-muted-foreground">Tip: Drag and drop your selection directly onto this field.</p>
                </div>
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {images.map((src, i) => (
                      <img key={i} src={src} alt={`Bulk upload preview ${i + 1}`} className="aspect-square w-full object-cover rounded-md border" loading="lazy" />
                    ))}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button variant="hero">Process Upload</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground mt-6">Note: Functionality will be connected to Supabase for authentication, storage, and database. This UI is ready for integration.</p>
      </main>
    </div>
  );
}
