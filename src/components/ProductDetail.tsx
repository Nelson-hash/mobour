import React, { useState } from 'react';
import { ShoppingBag, Share2, Minus, Plus } from 'lucide-react';
import { Product } from '../types/product';
import { useCart } from '../hooks/useCart';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="aspect-square bg-gray-50 rounded-lg overflow-hidden cursor-zoom-in"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isZoomed ? 'scale-150' : 'scale-100 hover:scale-105'
                }`}
              />
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 ${
                    selectedImage === index 
                      ? 'ring-2 ring-gray-900 ring-offset-2' 
                      : 'hover:opacity-75'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {product.category}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-light text-gray-900">
              {product.name}
            </h1>

            {/* Price */}
            <div className="text-4xl font-bold text-gray-900">
              {product.price}€
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 leading-relaxed">
              Cendrier au design industriel épuré, alliant esthétisme et fonctionnalité. 
              Fabriqué avec des matériaux de qualité pour une utilisation durable et élégante.
            </p>

            {/* Specifications */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">Spécifications</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Matériau:</span>
                  <span className="ml-2 font-medium">{product.specifications.material}</span>
                </div>
                <div>
                  <span className="text-gray-600">Dimensions:</span>
                  <span className="ml-2 font-medium">{product.specifications.dimensions}</span>
                </div>
                <div>
                  <span className="text-gray-600">Poids:</span>
                  <span className="ml-2 font-medium">{product.specifications.weight}</span>
                </div>
                <div>
                  <span className="text-gray-600">Finition:</span>
                  <span className="ml-2 font-medium">{product.specifications.finish}</span>
                </div>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              {/* Quantity */}
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900">Quantité:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-lg font-medium rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    product.inStock
                      ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{product.inStock ? 'Ajouter au Panier' : 'Produit Épuisé'}</span>
                </button>

                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div className={`flex items-center space-x-2 text-sm ${
              product.inStock ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                product.inStock ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>
                {product.inStock ? 'En stock - Livraison sous 2-3 jours' : 'Produit temporairement indisponible'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
