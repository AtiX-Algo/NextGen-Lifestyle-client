import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import NotificationPreferencesPage from './pages/NotificationPreferencesPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ErrorBoundary from './components/ErrorBoundary';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content">
      <Navbar />
      <div className="fixed bottom-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <Toaster position="top-right" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/preferences/notifications" element={<NotificationPreferencesPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/orders" replace />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route index element={<Navigate to="orders" replace />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;