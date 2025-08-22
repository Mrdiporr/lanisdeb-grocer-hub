import { useMemo, useState } from "react";
import heroImage from "@/assets/hero-grocery.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
const categories = [{
  id: "produce",
  name: "Fresh Produce",
  blurb: "Plantains, yams, okra, peppers and more"
}, {
  id: "pantry",
  name: "Pantry Staples",
  blurb: "Fufu, garri, spices, sauces"
}, {
  id: "frozen",
  name: "Frozen",
  blurb: "Seafood, vegetables, specialty items"
}, {
  id: "beverages",
  name: "Beverages",
  blurb: "Malta, tropical juices, herbal drinks"
}];
const featured = [{
  id: 1,
  name: "Yellow Plantain (each)",
  price: 1.29
}, {
  id: 2,
  name: "Egusi Seeds 500g",
  price: 8.5
}, {
  id: 3,
  name: "Jollof Rice Spice Mix",
  price: 4.99
}, {
  id: 4,
  name: "Scotch Bonnet Peppers",
  price: 3.5
}];
export default function Index() {
  const [spot, setSpot] = useState<{
    x: number;
    y: number;
  }>({
    x: 50,
    y: 50
  });
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    name: "Lanisdeb African & Caribbean Market",
    image: ["/lovable-uploads/78d15118-e2f7-4ec1-92df-3aabde77ded8.png"],
    url: "https://lanisdebmarket.com/",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Brooklyn, NY",
      addressLocality: "Brooklyn",
      addressRegion: "NY",
      addressCountry: "US"
    }
  }), []);
  return <div className="min-h-screen">
      <SEO title="Lanisdeb African & Caribbean Market | Brooklyn Grocery" description="Shop authentic African & Caribbean groceries in Brooklyn. Fresh produce, pantry staples, and more." canonical="https://lanisdebmarket.com/" jsonLd={jsonLd} />

      <header className="border-b">
        <nav className="container mx-auto flex items-center justify-between py-5">
          <a href="#" className="flex items-center gap-3">
            <img src="/lovable-uploads/78d15118-e2f7-4ec1-92df-3aabde77ded8.png" alt="Lanisdeb African & Caribbean Market logo" className="h-9 w-auto animate-float" />
            <span className="font-semibold">Lanisdeb Market</span>
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#categories" className="hover:underline">Categories</a>
            <a href="#featured" className="hover:underline">Featured</a>
            <a href="/admin" className="hover:underline">Admin</a>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Sign in</Button>
            <Button variant="hero">Shop now</Button>
          </div>
        </nav>
      </header>

      <section onMouseMove={e => {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * 100;
      const y = (e.clientY - rect.top) / rect.height * 100;
      setSpot({
        x,
        y
      });
    }} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-80" />
        <img src={heroImage} alt="Fresh African & Caribbean produce at Lanisdeb Market" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0" style={{
        background: `radial-gradient(600px at ${spot.x}% ${spot.y}%, hsl(var(--accent)/0.25), transparent 60%)`
      }} />
        <div className="relative">
          <div className="container mx-auto py-24 md:py-32 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight text-[#fb07fb]/15 md:text-[_#f7edef]">
                Brooklyn's Home for African & Caribbean Groceries
              </h1>
              <p className="text-lg max-w-prose text-[#f7edef] font-extrabold text-center"> The Taste of Home, Near and Far!</p>
              <div className="flex gap-3">
                <Button variant="hero">Browse products</Button>
                <Button variant="premium">View categories</Button>
              </div>
              
            </div>
          </div>
        </div>
        </section>

        {/* Featured Promotions Section */}
        <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Featured Promotions
              </h2>
              <p className="text-muted-foreground text-lg">
                Discover our authentic African & Caribbean products and special offers
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <img 
                src="/lovable-uploads/717534ce-9778-4308-82c7-1cd76d19629c.png" 
                alt="Lanisdeb African & Caribbean Market promotional flyer featuring authentic fabrics, jewelry, spices, and special offers" 
                className="w-full rounded-2xl shadow-2xl hover:shadow-glow transition-all duration-300 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          </div>
        </section>

      <main>
        <section id="categories" className="container mx-auto py-14">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold">Shop by category</h2>
            <p className="text-muted-foreground">Curated essentials from Africa and the Caribbean</p>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            {categories.map(c => <Card key={c.id} className="shadow-elevate hover:shadow-glow transition-shadow">
                <CardContent className="p-5">
                  <div className="h-36 rounded-md bg-gradient-to-br from-[hsl(var(--primary)/0.12)] to-[hsl(var(--accent)/0.12)] mb-4" />
                  <h3 className="font-medium">{c.name}</h3>
                  <p className="text-sm text-muted-foreground">{c.blurb}</p>
                </CardContent>
              </Card>)}
          </div>
        </section>

        <section id="featured" className="bg-secondary/40 py-14">
          <div className="container mx-auto">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold">Featured picks</h2>
                <p className="text-muted-foreground">Fresh and popular this week</p>
              </div>
              <Button variant="outline">See all</Button>
            </div>
            <div className="grid gap-5 md:grid-cols-4">
              {featured.map(p => <Card key={p.id} className="group">
                  <CardContent className="p-5">
                    <div className="aspect-square w-full rounded-md bg-gradient-to-br from-[hsl(var(--primary)/0.08)] to-[hsl(var(--accent)/0.08)] mb-4" />
                    <h3 className="font-medium group-hover:underline">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">${p.price.toFixed(2)}</p>
                    <div className="pt-3">
                      <Button size="sm">Add to cart</Button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto py-10 text-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Lanisdeb African & Caribbean Market</p>
          <nav className="flex gap-5">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="/admin" className="hover:underline">Admin</a>
          </nav>
        </div>
      </footer>
    </div>;
}