import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, UserRole, AppDispatch } from '../store';
import { useNavigate } from 'react-router-dom';
import { updateOrder } from '../api';
import { fetchOrders } from '../store';

interface OrderDetailsProps {
  orderId: string;
  userRole: UserRole;
}

const STATUS_CONFIG = {
  Active:    { icon: 'schedule',      bg: 'bg-blue-50',   text: 'text-blue-600',   label: 'Active' },
  Pending:   { icon: 'hourglass_top', bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'Pending' },
  Completed: { icon: 'check_circle',  bg: 'bg-green-50',  text: 'text-green-600',  label: 'Completed' },
  Cancelled: { icon: 'cancel',        bg: 'bg-red-50',    text: 'text-red-500',    label: 'Cancelled' },
} as const;

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, userRole }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { history } = useSelector((state: RootState) => state.orders);
  const [pendingStatus, setPendingStatus] = useState<'Completed' | 'Cancelled' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const order = history.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-background-light items-center justify-center p-4">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-slate-300">error</span>
          <h2 className="text-xl font-bold">Order not found</h2>
          <button onClick={() => navigate('/orders')} className="px-6 py-3 bg-primary text-background-dark font-bold rounded-xl mt-4">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.Active;

  const handleConfirmStatus = async () => {
    if (!pendingStatus) return;
    setIsSaving(true);
    try {
      await updateOrder(order.id, { status: pendingStatus });
      await dispatch(fetchOrders());
      setPendingStatus(null);
      navigate('/orders');
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light max-w-2xl mx-auto">
      <header className="sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center p-4 gap-4">
          <button onClick={() => navigate('/orders')} className="size-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-slate-50 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-lg font-bold tracking-tight leading-tight">Order #{order.id}</h2>
            <p className="text-xs text-slate-500">{order.date}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6 overflow-y-auto pb-36">
        {/* Status Card */}
        <section className="bg-white rounded-xl p-4 shadow-sm border border-primary/10">
          <div className="flex items-center gap-3">
            <div className={`size-12 rounded-full ${statusCfg.bg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${statusCfg.text} text-2xl`}>{statusCfg.icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{statusCfg.label}</h3>
              <p className="text-sm text-slate-500">Pedido en FlashDrop</p>
            </div>
          </div>
        </section>

        {/* Delivery Details */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-primary px-1">
            <span className="material-symbols-outlined text-lg">local_shipping</span>
            <h3 className="font-bold">Detalles de entrega</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-slate-400 mt-0.5">person</span>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Destinatario</p>
                <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                <p className="text-xs text-slate-600 mt-0.5">{order.customerPhone}</p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-slate-400 mt-0.5">location_on</span>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-0.5">Dirección</p>
                <p className="text-sm font-medium text-slate-900 leading-snug">{order.deliveryAddress}</p>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 mt-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-200"
            >
              <span className="material-symbols-outlined text-[18px]">map</span> Abrir en Google Maps
            </a>
          </div>
        </section>

        {/* Order Items */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-primary px-1">
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            <h3 className="font-bold">Resumen del pedido</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            {order.items.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-2">Sin detalle de productos</p>
            ) : (
              order.items.map(item => (
                <div key={item.cartItemId || item.id} className="flex items-start gap-3 py-1">
                  <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-slate-400">lunch_dining</span>
                  </div>
                  <div className="flex-1 py-0.5">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {item.name}
                      {(item.flavors?.length || item.breadType) && (
                        <span className="block text-xs font-normal text-slate-500 mt-1">
                          {item.breadType && <span className="mr-1">{item.breadType}</span>}
                          {item.flavors && item.flavors.length > 0 && `(${item.flavors.join(' & ')})`}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900 py-0.5">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))
            )}

            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex justify-between font-bold text-lg pt-2">
                <span className="text-slate-900">Total</span>
                <span className="text-yellow-accent">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Admin Action Bar */}
      {userRole === 'admin' && order.status !== 'Completed' && order.status !== 'Cancelled' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-center gap-8 max-w-2xl mx-auto">
          <button
            onClick={() => setPendingStatus('Completed')}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="size-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm border border-green-100">
              <span className="material-symbols-outlined text-2xl">done_all</span>
            </div>
            <span className="text-xs font-bold text-slate-700">Completado</span>
          </button>

          <button
            onClick={() => setPendingStatus('Cancelled')}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="size-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm border border-red-100">
              <span className="material-symbols-outlined text-2xl">cancel</span>
            </div>
            <span className="text-xs font-bold text-slate-700">Cancelado</span>
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isSaving && setPendingStatus(null)}
          />
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`size-16 rounded-full flex items-center justify-center ${
                pendingStatus === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
              }`}>
                <span className="material-symbols-outlined text-3xl">
                  {pendingStatus === 'Completed' ? 'done_all' : 'cancel'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Marcar como {pendingStatus === 'Completed' ? 'Completado' : 'Cancelado'}
                </h3>
                <p className="text-slate-500 mt-2 text-sm">
                  ¿Estás seguro? Esta acción cambiará el estatus del pedido.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setPendingStatus(null)}
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmStatus}
                  disabled={isSaving}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                    pendingStatus === 'Completed' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {isSaving ? (
                    <span className="block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
