/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { store, RootState, UserRole, AppDispatch } from './store';
import { Home } from './components/Home';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { Orders } from './components/Orders';
import { OrderDetails } from './components/OrderDetails';
import { MenuAdmin } from './components/MenuAdmin';
import { Profile } from './components/Profile';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { LoadingSpinner } from './components/LoadingSpinner';
import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useSelector((state: RootState) => state.auth);
  const userRole = auth.currentUser?.role || 'user';
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const menuStatus = useSelector((state: RootState) => state.menu.status);

  React.useEffect(() => {
    // We import these thunks from store to fetch data immediately
    import('./store').then(({ fetchMenuData }) => {
      dispatch(fetchMenuData());
    });
  }, [dispatch]);

  const isHome = location.pathname === '/';
  const isOrders = location.pathname === '/orders';
  const isProfile = location.pathname === '/profile';
  const isMenuAdmin = location.pathname === '/menu';
  const isCart = location.pathname === '/cart';
  const isCheckout = location.pathname === '/checkout';

  const showNav = isHome || isOrders || isProfile || isMenuAdmin;

  if (menuStatus === 'loading') {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto min-h-screen flex flex-col relative bg-background-light overflow-x-hidden">
      {isHome && (
        <header className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-md border-b border-primary/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary pt-1 pb-0 px-1 rounded-lg">
                <span className="material-symbols-outlined text-background-dark text-2xl font-bold">bolt</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">FlashDrop</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/orders')}
                className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
              >
                Orders
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={`flex-1 ${showNav ? 'pb-24' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetailsWrapper userRole={userRole} />} />
              <Route path="/menu" element={userRole === 'admin' ? <MenuAdmin /> : <Navigate to="/" />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-primary/10 px-4 py-2 z-50">
          <div className="max-w-7xl mx-auto flex justify-around items-center px-6 md:px-12 lg:px-20">
            <button 
              onClick={() => navigate('/')}
              className={`flex flex-col items-center gap-1 p-2 ${isHome ? 'text-primary' : 'text-slate-400'}`}
            >
              <span className={`material-symbols-outlined ${isHome ? 'fill-[1]' : ''}`}>home</span>
              <span className="text-[10px] font-bold">Home</span>
            </button>
            <button 
              onClick={() => navigate('/orders')}
              className={`flex flex-col items-center gap-1 p-2 ${isOrders ? 'text-primary' : 'text-slate-400'}`}
            >
              <span className={`material-symbols-outlined ${isOrders ? 'fill-[1]' : ''}`}>receipt_long</span>
              <span className="text-[10px] font-medium">Orders</span>
            </button>
            {userRole === 'admin' && (
              <button
                onClick={() => navigate('/menu')}
                className={`flex flex-col items-center gap-1 p-2 ${isMenuAdmin ? 'text-primary' : 'text-slate-400'}`}
              >
                <span className={`material-symbols-outlined ${isMenuAdmin ? 'fill-[1]' : ''}`}>settings</span>
                <span className="text-[10px] font-medium">Menu</span>
              </button>
            )}
            <button
              onClick={() => navigate('/profile')}
              className={`flex flex-col items-center gap-1 p-2 ${isProfile ? 'text-primary' : 'text-slate-400'}`}
            >
              <span className={`material-symbols-outlined ${isProfile ? 'fill-[1]' : ''}`}>person</span>
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          </div>
        </nav>
      )}

      {/* Floating cart button — only visible when there are items */}
      <AnimatePresence>
        {cartCount > 0 && !isCart && !isCheckout && !isMenuAdmin && (
          <motion.button
            key="fab-cart"
            onClick={() => navigate('/cart')}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-24 right-4 md:right-8 lg:right-12 z-50 bg-primary text-background-dark w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background-dark text-primary text-[11px] font-bold">
              {cartCount}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper components for Routes
import { useParams } from 'react-router-dom';

const OrderDetailsWrapper: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const { id } = useParams<{ id: string }>();
  return <OrderDetails orderId={id!} userRole={userRole} />;
};

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
