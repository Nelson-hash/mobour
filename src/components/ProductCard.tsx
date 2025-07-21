import React, { useState } from 'react';
import { Product } from '../types/product';
import { useCart } from '../hooks/useCart';

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewProduct }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageHover = () => {
    if (product.images.length > 1) {
      setCurrentImageIndex(1);
    }
  };

  const handleImageLeave = () => {
    setCurrentImageIndex(0);
  };

  return (
    <div 
      className="group bg-white cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewProduct(product)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 mb-4">
        <img
          src={product.images[currentImageIndex]}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-300"
          onMouseEnter={handleImageHover}
          onMouseLeave={handleImageLeave}
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {product.category}
        </div>
        
        <h3 className="text-base font-medium text-gray-900">
          {product.name}
        </h3>
        
        <div className="text-sm text-gray-900 font-medium">
          from €{product.price},00 EUR
        </div>
      </div>
    </div>
  );
};

export default ProductCard;