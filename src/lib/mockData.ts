// Mock data for development when Supabase isn't configured
export const mockCategories = [
  {
    id: "produce",
    name: "Fresh Produce",
    description: "Fresh fruits and vegetables from Africa and the Caribbean",
    created_at: new Date().toISOString()
  },
  {
    id: "pantry",
    name: "Pantry Staples",
    description: "Essential ingredients and pantry items",
    created_at: new Date().toISOString()
  },
  {
    id: "frozen",
    name: "Frozen",
    description: "Frozen seafood, vegetables, and specialty items",
    created_at: new Date().toISOString()
  },
  {
    id: "beverages",
    name: "Beverages",
    description: "Traditional drinks and beverages",
    created_at: new Date().toISOString()
  },
  {
    id: "snacks",
    name: "Snacks",
    description: "Traditional snacks and treats",
    created_at: new Date().toISOString()
  }
];

export const mockProducts = [
  {
    id: "1",
    name: "Yellow Plantain (each)",
    description: "Fresh yellow plantains, perfect for frying or baking",
    price: 1.29,
    category_id: "produce",
    category: { name: "Fresh Produce" },
    sku: "LAN-PLT-001",
    stock_quantity: 50,
    is_active: true,
    image_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Egusi Seeds 500g",
    description: "Premium ground egusi seeds for traditional soups",
    price: 8.50,
    category_id: "pantry",
    category: { name: "Pantry Staples" },
    sku: "LAN-EGU-002",
    stock_quantity: 25,
    is_active: true,
    image_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "Jollof Rice Spice Mix",
    description: "Authentic blend of spices for perfect jollof rice",
    price: 4.99,
    category_id: "pantry",
    category: { name: "Pantry Staples" },
    sku: "LAN-JOL-003",
    stock_quantity: 40,
    is_active: true,
    image_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: "4",
    name: "Scotch Bonnet Peppers",
    description: "Hot and flavorful scotch bonnet peppers",
    price: 3.50,
    category_id: "produce",
    category: { name: "Fresh Produce" },
    sku: "LAN-SBP-004",
    stock_quantity: 0,
    is_active: true,
    image_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: "5",
    name: "Malta Goya Original",
    description: "Classic malta beverage, 12oz bottle",
    price: 2.99,
    category_id: "beverages",
    category: { name: "Beverages" },
    sku: "LAN-MAL-005",
    stock_quantity: 100,
    is_active: true,
    image_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: "6",
    name: "Fufu Flour 4lb",
    description: "Traditional fufu flour for authentic preparation",
    price: 12.99,
    category_id: "pantry",
    category: { name: "Pantry Staples" },
    sku: "LAN-FUF-006",
    stock_quantity: 15,
    is_active: true,
    image_url: null,
    created_at: new Date().toISOString()
  }
];