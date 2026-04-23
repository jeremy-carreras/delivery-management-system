import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, addToCart, clearCart } from '../store';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';
import { motion, AnimatePresence } from 'motion/react';

export const OrdersHistory: React.FC = () => {
  const profile = useSelector((state: RootState) => state.profile);
  const { products } = useSelector((state: RootState) => state.menu);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [phone, setPhone] = useState(profile.phone);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All Orders');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await api.getOrders(phone.trim());
      // Sort by date DESC
      const sorted = (res.data || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(sorted);
      setSearched(true);
    } catch (err: any) {
      setError('Error al obtener el historial de pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile.phone) {
      handleSearch();
    }
  }, []);

  const handleRepeatOrder = (order: any) => {
    dispatch(clearCart());
    
    let hasMissingItems = false;

    (order.items || []).forEach((item: any) => {
      // Find current product in menu to get the current price and id
      const currentProduct = products.find(p => p.name === item.product_name);
      
      if (currentProduct) {
        let flavors = [];
        try {
          flavors = item.flavors ? (typeof item.flavors === 'string' ? JSON.parse(item.flavors) : item.flavors) : [];
        } catch (e) {}

        // Add to cart quantity times
        for(let i = 0; i < item.quantity; i++) {
          dispatch(addToCart({
            ...currentProduct,
            flavors,
            breadType: item.bread_type || undefined,
          }));
        }
      } else {
        hasMissingItems = true;
      }
    });

    if (hasMissingItems) {
      alert('Algunos productos de este pedido ya no están disponibles en el menú.');
    }

    navigate('/cart');
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto flex flex-col min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate('/')}
          className="size-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Repetir Pedido</h2>
      </div>

      {error && <p className="text-red-500 text-xs font-bold mt-2 mb-4 text-center">{error}</p>}

      {searched && orders.length > 0 && (
        <div className="mb-4">
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-1 border-b border-slate-100">
            {['All Orders', 'Pending', 'Accepted', 'Preparando', 'En reparto', 'Entregado', 'Cancelled'].map((tab) => {
              const displayTabInfo: Record<string, string> = {
                'All Orders': 'Todos',
                'Pending': 'Pendientes',
                'Accepted': 'Aceptados',
                'Preparando': 'En cocina',
                'En reparto': 'En camino',
                'Entregado': 'Entregados',
                'Cancelled': 'Cancelados'
              };
              return (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center justify-center border-b-2 pb-2 pt-1 whitespace-nowrap text-sm font-bold ${
                  activeTab === tab ? 'border-primary text-slate-900 border-primary' : 'border-transparent text-slate-500 hover:text-slate-700'
                } transition-colors`}
              >
                {displayTabInfo[tab] || tab}
              </button>
            )})}
          </div>
        </div>
      )}

      <div className="flex-1 space-y-4">
        {!loading && searched && orders.length === 0 && (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">history_toggle_off</span>
            <p className="font-semibold text-lg text-slate-600">No tienes pedidos</p>
            <p className="text-sm mt-1">Con este número no encontramos historial.</p>
          </div>
        )}

        {!loading && searched && orders.length > 0 && orders.filter(o => activeTab === 'All Orders' || o.status === activeTab).length === 0 && (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">filter_list_off</span>
            <p className="font-semibold text-lg text-slate-600">Sin pedidos</p>
            <p className="text-sm mt-1">No hay pedidos con este estatus en tu historial.</p>
          </div>
        )}

        {orders.filter(o => activeTab === 'All Orders' || o.status === activeTab).map((order) => {
          const itemsSummary = (order.items || []).map((i: any) => `${i.quantity}x ${i.product_name}`).join(', ');
          
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={order.id} 
              className="bg-white border text-left border-slate-200 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-400">Pedido #{order.id}</span>
                      <p className="text-slate-900 font-bold text-lg mt-0.5">${Number(order.total).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-500 block">
                        {new Date(order.created_at).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border inline-block mt-1 
                        ${order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-200' : 
                          order.status === 'Entregado' ? 'bg-green-50 text-green-600 border-green-200' : 
                          'bg-slate-50 text-slate-600 border-slate-200'}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3">
                    <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">restaurant_menu</span>
                    <p className="text-sm text-slate-600 leading-snug line-clamp-2">
                      {itemsSummary}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRepeatOrder(order)}
                  className="size-12 shrink-0 bg-primary/10 hover:bg-primary text-primary hover:text-slate-900 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-3xl">chevron_right</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
