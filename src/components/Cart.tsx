import React, { useMemo, useCallback } from 'react';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';

interface CartProps {
  onBack: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ onBack, onCheckout }) => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();

  // Memoize expensive calculations
  const totalPrice = useMemo(() => getTotalPrice(), [cartItems]);
  const totalItems = useMemo(() => getTotalItems(), [cartItems]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleQuantityUpdate = useCallback((productId: number, quantity: number) => {
    updateQuantity(productId, quantity);
  }, [updateQuantity]);

  const handleRemoveItem = useCallback((productId: number) => {
    removeFromCart(productId);
  }, [removeFromCart]);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-8" />
            <h2 className="text-2xl font-light text-gray-900 mb-4">
              Votre panier est vide
            </h2>
            <p className="text-gray-600 mb-8">
              Découvrez notre collection de mobilier industriel épuré
            </p>
            <button
              onClick={onBack}
              className="bg-gray-900 text-white px-8 py-3 hover:bg-gray-800 transition-colors"
            >
              Continuer mes achats
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Continuer mes achats</span>
          </button>
          <h1 className="text-2xl font-light text-gray-900">
            Mon Panier ({totalItems} article{totalItems > 1 ? 's' : ''})
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onQuantityUpdate={handleQuantityUpdate}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Récapitulatif
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{totalPrice.toFixed(0)}€</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>Gratuite</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{totalPrice.toFixed(0)}€</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full bg-gray-900 text-white py-4 text-lg font-medium hover:bg-gray-800 transition-colors mb-4"
              >
                Finaliser la commande
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Livraison gratuite • Retour sous 30 jours
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Paiement sécurisé SSL</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Livraison assurée</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>SAV disponible 7j/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoized cart item component to prevent unnecessary re-renders
const CartItem = React.memo<{
  item: any;
  onQuantityUpdate: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}>(({ item, onQuantityUpdate, onRemove }) => {
  const handleQuantityChange = useCallback((change: number) => {
    onQuantityUpdate(item.product.id, item.quantity + change);
  }, [item.product.id, item.quantity, onQuantityUpdate]);

  const handleRemove = useCallback(() => {
    onRemove(item.product.id);
  }, [item.product.id, onRemove]);

  const subtotal = useMemo(() => {
    return (item.product.price * item.quantity).toFixed(0);
  }, [item.product.price, item.quantity]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center space-x-6">
        {/* Product Image */}
        <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={item.product.images[0]}
            alt={item.product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 mb-1">
            {item.product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {item.product.category}
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {item.product.price}€
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={item.quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-center min-w-[2rem] font-medium">
            {item.quantity}
          </span>
          <button
            onClick={() => handleQuantityChange(1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">
            {subtotal}€
          </p>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

CartItem.displayName = 'CartItem';

export default Cart;
