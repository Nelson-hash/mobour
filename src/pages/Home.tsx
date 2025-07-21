import React from 'react';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import { products } from '../data/products';
import { Product } from '../types/product';

interface HomeProps {
  onPageChange: (page: string) => void;
  onViewProduct: (product: Product) => void;
}

const Home: React.FC<HomeProps> = ({ onPageChange, onViewProduct }) => {
  return (
    <>
      <Hero onPageChange={onPageChange} />
      <ProductGrid 
        products={products} 
        title="Collection"
        onViewProduct={onViewProduct}
      />
    </>
  );
};

export default Home;