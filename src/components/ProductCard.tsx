import React, { useState, useCallback, memo } from 'react';
import { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ product, onViewProduct }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageHover = useCallback(() => {
    if (product.images.length > 1 && !imageError) {
      setCurrentImageIndex(1);
    }
  }, [product.images.length, imageError]);

  const handleImageLeave = useCallback(() => {
    setCurrentImageIndex(0);
  }, []);

  const handleClick = useCallback(() => {
    onViewProduct(product);
  }, [product, onViewProduct]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <div 
      className="group bg-white cursor-pointer"
      onClick={handleClick}
    >
      {/* Image Container with loading state */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
        )}
        
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-gray-400 text-center">
              <div className="w-16 h-16 bg-gray-300 rounded mx-auto mb-2"></div>
              <p className="text-xs">Image non disponible</p>
            </div>
          </div>
        ) : (
          <img
            src={product.images[currentImageIndex]}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onMouseEnter={handleImageHover}
            onMouseLeave={handleImageLeave}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {product.category}
        </div>
        
        <h3 className="text-base font-medium text-gray-900 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="text-sm text-gray-900 font-medium">
          from €{product.price},00 EUR
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
