/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { store, RootState, UserRole, AppDispatch } from './store';
import { Home } from './components/Home';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { Orders } from './components/Orders';
import { OrderDetails } from './components/OrderDetails';
import { MenuAdmin } from './components/MenuAdmin';
import { UsersAdmin } from './components/UsersAdmin';
import { Profile } from './components/Profile';
import { WorkerProfile } from './components/WorkerProfile';
import { OrdersHistory } from './components/OrdersHistory';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { LoadingSpinner } from './components/LoadingSpinner';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from './assets/img/boropapas-icon.png';

const OrderDetailsWrapper: React.FC<{ userRole?: string | null }> = ({ userRole }) => {
  const { id } = useParams<{ id: string }>();
  return <OrderDetails orderId={id!} userRole={userRole} />;
};

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useSelector((state: RootState) => state.auth);
  const userRole = auth.currentUser?.role ?? null;
  const isStaffOnly = userRole === 'repartidor' || userRole === 'preparador';
  const isAdmin = userRole === 'admin';
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const menuStatus = useSelector((state: RootState) => state.menu.status);

  const [hasCriticalError, setHasCriticalError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (e: ErrorEvent | PromiseRejectionEvent) => {
      // Prevent the default browser behavior
      e.preventDefault();
      setHasCriticalError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  React.useEffect(() => {
    import('./store').then(({ fetchMenuData }) => {
      dispatch(fetchMenuData());
    });
  }, [dispatch]);

  const isHome = location.pathname === '/';
  const isOrders = location.pathname === '/orders';
  const isProfile = location.pathname === '/profile';
  const isWorkerProfile = location.pathname === '/workerProfile';
  const isOrdersHistory = location.pathname === '/ordersHistory';
  const isMenuAdmin = location.pathname === '/menu';
  const isUsersAdmin = location.pathname === '/admin/users';
  const isCart = location.pathname === '/cart';
  const isCheckout = location.pathname === '/checkout';

  // Staff only see the Orders tab in the nav; admin sees everything
  const showNav = isAdmin
    ? (isHome || isOrders || isProfile || isWorkerProfile || isOrdersHistory || isMenuAdmin || isUsersAdmin)
    : isStaffOnly
      ? (isOrders || isWorkerProfile)
      : (isHome || isOrders || isProfile || isOrdersHistory || isMenuAdmin);

  if (hasCriticalError || menuStatus === 'failed') {
    return (
      <div className="fixed inset-0 z-[9999] bg-background-light flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Oops, algo salió mal</h2>
        <p className="text-slate-500 font-medium mb-6">
          Inténtalo más tarde o contáctanos por WhatsApp al número <span className="text-slate-700 font-bold whitespace-nowrap">1234567890</span>
        </p>
      </div>
    );
  }

  if (menuStatus === 'loading') {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto min-h-screen flex flex-col relative bg-background-light overflow-x-hidden">
      {isHome && !isStaffOnly && (
        <header className="sticky top-0 z-50 bg-background-light/80 backdrop-blur-md border-b border-primary/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="Logo" className="w-12 h-12 object-contain shrink-0" />
              <h1 className="text-xl font-bold tracking-tight">Pide Borolas</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/orders')}
                className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
              >
                Pedidos
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
              {/* Workers (repartidor/preparador) are redirected away from non-orders pages */}
              <Route path="/" element={isStaffOnly ? <Navigate to="/orders" /> : <Home />} />
              <Route path="/cart" element={isStaffOnly ? <Navigate to="/orders" /> : <Cart />} />
              <Route path="/checkout" element={isStaffOnly ? <Navigate to="/orders" /> : <Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route
                path="/orders/:id"
                element={<OrderDetailsWrapper userRole={userRole} />}
              />
              <Route path="/menu" element={isAdmin ? <MenuAdmin /> : <Navigate to="/" />} />
              <Route path="/admin/users" element={isAdmin ? <UsersAdmin /> : <Navigate to="/" />} />
              <Route path="/profile" element={isStaffOnly ? <Navigate to="/orders" /> : <Profile />} />
              <Route path="/workerProfile" element={(isStaffOnly || isAdmin) ? <WorkerProfile /> : <Navigate to="/login" />} />
              <Route path="/ordersHistory" element={isStaffOnly ? <Navigate to="/orders" /> : <OrdersHistory />} />
              <Route path="/login" element={<Login />} />
              {/*<Route path="/register" element={<Register />} />*/}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-primary/10 px-4 py-2 z-50">
          <div className="max-w-7xl mx-auto flex justify-around items-center px-0 md:px-12 lg:px-20">
            {/* Inicio — hidden for staff only, but visible to Admin so they can access all routes */}
            {!isStaffOnly && (
              <button
                onClick={() => navigate('/')}
                className={`flex flex-col items-center gap-1 p-2 ${isHome ? 'text-primary' : 'text-slate-400'}`}
              >
                <span className={`material-symbols-outlined ${isHome ? 'fill-[1]' : ''}`}>home</span>
                <span className="text-[10px] font-bold">Inicio</span>
              </button>
            )}

            <button
              onClick={() => navigate('/orders')}
              className={`flex flex-col items-center gap-1 p-2 ${isOrders ? 'text-primary' : 'text-slate-400'}`}
            >
              <span className={`material-symbols-outlined ${isOrders ? 'fill-[1]' : ''}`}>receipt_long</span>
              <span className="text-[10px] font-medium">Pedidos</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => navigate('/menu')}
                className={`flex flex-col items-center gap-1 p-2 ${isMenuAdmin ? 'text-primary' : 'text-slate-400'}`}
              >
                <span className={`material-symbols-outlined ${isMenuAdmin ? 'fill-[1]' : ''}`}>restaurant_menu</span>
                <span className="text-[10px] font-medium">Menú</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => navigate('/admin/users')}
                className={`flex flex-col items-center gap-1 p-2 ${isUsersAdmin ? 'text-primary' : 'text-slate-400'}`}
              >
                <span className={`material-symbols-outlined ${isUsersAdmin ? 'fill-[1]' : ''}`}>manage_accounts</span>
                <span className="text-[10px] font-medium">Usuarios</span>
              </button>
            )}

            {/* Profile — visible to everyone, routes depend on role */}
            <button
              onClick={() => navigate((isStaffOnly || isAdmin) ? '/workerProfile' : '/profile')}
              className={`flex flex-col items-center gap-1 p-2 ${(isProfile || isWorkerProfile) ? 'text-primary' : 'text-slate-400'}`}
            >
              <span className={`material-symbols-outlined ${(isProfile || isWorkerProfile) ? 'fill-[1]' : ''}`}>person</span>
              <span className="text-[10px] font-medium">Perfil</span>
            </button>
          </div>
        </nav>
      )}

      {/* Floating cart button — only visible when there are items and user is not staff */}
      <AnimatePresence>
        {cartCount > 0 && !isCart && !isCheckout && !isMenuAdmin && !isStaffOnly && (
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

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
