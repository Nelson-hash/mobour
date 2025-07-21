import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import { Product } from './types/product';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setSelectedProduct(null);
    window.scrollTo(0, 0);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
    window.scrollTo(0, 0);
  };

  const handleBackFromProduct = () => {
    setSelectedProduct(null);
    setCurrentPage('catalog');
  };

  const handleCheckout = () => {
    setCurrentPage('checkout');
    window.scrollTo(0, 0);
  };

  const handleOrderComplete = () => {
    setCurrentPage('home');
    window.scrollTo(0, 0);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            onPageChange={handlePageChange} 
            onViewProduct={handleViewProduct}
          />
        );
      case 'catalog':
        return <Catalog onViewProduct={handleViewProduct} />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      case 'product-detail':
        return selectedProduct ? (
          <ProductDetail 
            product={selectedProduct} 
            onBack={handleBackFromProduct}
          />
        ) : null;
      case 'cart':
        return (
          <Cart 
            onBack={() => handlePageChange('catalog')} 
            onCheckout={handleCheckout}
          />
        );
      case 'checkout':
        return (
          <Checkout 
            onBack={() => handlePageChange('cart')} 
            onOrderComplete={handleOrderComplete}
          />
        );
      default:
        return (
          <Home 
            onPageChange={handlePageChange} 
            onViewProduct={handleViewProduct}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onPageChange={handlePageChange} currentPage={currentPage} />
      <main>
        {renderCurrentPage()}
      </main>
      {currentPage !== 'product-detail' && currentPage !== 'cart' && currentPage !== 'checkout' && (
        <Footer />
      )}
    </div>
  );
}

export default App;