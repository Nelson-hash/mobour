export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  specifications: {
    material: string;
    dimensions: string;
    weight: string;
    finish: string;
  };
  inStock: boolean;
  featured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}