import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { Product } from './types/product';

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const Cart = lazy(() => import('./components/Cart'));
const Checkout = lazy(() => import('./components/Checkout'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Chargement...</p>
    </div>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Memoized handlers to prevent unnecessary re-renders
  const handlePageChange = useCallback((page: string) => {
    setCurrentPage(page);
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleViewProduct = useCallback((product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackFromProduct = useCallback(() => {
    setSelectedProduct(null);
    setCurrentPage('catalog');
  }, []);

  const handleCheckout = useCallback(() => {
    setCurrentPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleOrderComplete = useCallback(() => {
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackToCart = useCallback(() => {
    setCurrentPage('cart');
  }, []);

  const handleBackToCatalog = useCallback(() => {
    setCurrentPage('catalog');
  }, []);

  // Memoize the current page component to avoid unnecessary re-renders
  const currentPageComponent = useMemo(() => {
    const pageProps = {
      onPageChange: handlePageChange,
      onViewProduct: handleViewProduct,
      onBack: handleBackFromProduct,
      onCheckout: handleCheckout,
      onOrderComplete: handleOrderComplete,
      onBackToCart: handleBackToCart,
      onBackToCatalog: handleBackToCatalog,
      selectedProduct
    };

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
            onBack={handleBackToCatalog} 
            onCheckout={handleCheckout}
          />
        );
      case 'checkout':
        return (
          <Checkout 
            onBack={handleBackToCart} 
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
  }, [
    currentPage,
    selectedProduct,
    handlePageChange,
    handleViewProduct,
    handleBackFromProduct,
    handleCheckout,
    handleOrderComplete,
    handleBackToCart,
    handleBackToCatalog
  ]);

  // Determine if footer should be shown
  const shouldShowFooter = useMemo(() => {
    return !['product-detail', 'cart', 'checkout'].includes(currentPage);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-white">
      <Header onPageChange={handlePageChange} currentPage={currentPage} />
      <main>
        <Suspense fallback={<PageLoader />}>
          {currentPageComponent}
        </Suspense>
      </main>
      {shouldShowFooter && <Footer />}
    </div>
  );
}

export default App;
