import React from 'react';
import ProductGrid from '../components/ProductGrid';
import { products } from '../data/products';
import { Product } from '../types/product';

interface CatalogProps {
  onViewProduct: (product: Product) => void;
}

const Catalog: React.FC<CatalogProps> = ({ onViewProduct }) => {
  return (
    <div className="pt-20 min-h-screen">
      <ProductGrid 
        products={products} 
        title="Toute la Collection"
        onViewProduct={onViewProduct}
        showFilters={true}
      />
    </div>
  );
};

export default Catalog;