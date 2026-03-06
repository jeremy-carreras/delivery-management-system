import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, UserRole, AppDispatch } from '../store';
import { useNavigate } from 'react-router-dom';
import { updateOrder } from '../api';
import { fetchOrders } from '../store';
import { StatusTracker } from './StatusTracker';

interface OrderDetailsProps {
  orderId: string;
  userRole: UserRole;
}

type OrderStatus = 'Pending' | 'Accepted' | 'Preparando' | 'En reparto' | 'Entregado' | 'Cancelled';

const STATUS_FLOW: OrderStatus[] = ['Pending', 'Accepted', 'Preparando', 'En reparto', 'Entregado'];

const STATUS_CONFIG: Record<OrderStatus, { icon: string; bg: string; text: string; label: string }> = {
  Pending:      { icon: 'hourglass_top',    bg: 'bg-yellow-50',  text: 'text-yellow-600', label: 'Pendiente' },
  Accepted:     { icon: 'thumb_up',         bg: 'bg-blue-50',    text: 'text-blue-600',   label: 'Aceptado' },
  Preparando:   { icon: 'soup_kitchen',     bg: 'bg-orange-50',  text: 'text-orange-500', label: 'En preparación' },
  'En reparto': { icon: 'electric_moped',   bg: 'bg-purple-50',  text: 'text-purple-600', label: 'En reparto' },
  Entregado:    { icon: 'check_circle',     bg: 'bg-green-50',   text: 'text-green-600',  label: 'Entregado' },
  Cancelled:    { icon: 'cancel',           bg: 'bg-red-50',     text: 'text-red-500',    label: 'Cancelado' },
};

const NEXT_STEP_LABEL: Partial<Record<OrderStatus, string>> = {
  Pending:      'Aceptar pedido',
  Accepted:     'Iniciar preparación',
  Preparando:   'Enviar a reparto',
  'En reparto': 'Marcar entregado',
};

const NEXT_STEP_ICON: Partial<Record<OrderStatus, string>> = {
  Pending:      'thumb_up',
  Accepted:     'soup_kitchen',
  Preparando:   'electric_moped',
  'En reparto': 'check_circle',
};

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, userRole }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { history, loading } = useSelector((state: RootState) => state.orders);
  const profile = useSelector((state: RootState) => state.profile);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');
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

  const currentStatus = order.status as OrderStatus;
  const statusCfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.Pending;
  const currentIdx = STATUS_FLOW.indexOf(currentStatus);
  const nextStatus: OrderStatus | null = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1
    ? STATUS_FLOW[currentIdx + 1]
    : null;

  const isTerminal = currentStatus === 'Entregado' || currentStatus === 'Cancelled';

  const CANCEL_REASONS = [
    'El cliente no respondió',
    'No se encontró la ubicación',
    'Pedido duplicado',
    'Sin stock del producto',
    'Zona fuera de cobertura',
    'Cliente solicitó cancelación',
  ];

  const finalReason = selectedReason === 'Otra' ? customReason.trim() : selectedReason ?? '';

  const handleConfirmStatus = async () => {
    if (!pendingStatus) return;
    setIsSaving(true);
    try {
      const payload: Record<string, string> = { status: pendingStatus };
      if (pendingStatus === 'Cancelled' && finalReason) {
        payload.cancellation_reason = finalReason;
      }
      await updateOrder(order.id, payload);
      await dispatch(fetchOrders(userRole === 'admin' ? undefined : profile.phone));
      setPendingStatus(null);
      setSelectedReason(null);
      setCustomReason('');
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismiss = () => {
    if (!isSaving) {
      setPendingStatus(null);
      setSelectedReason(null);
      setCustomReason('');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light max-w-2xl mx-auto">
      <header className="sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/orders')} className="size-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="text-lg font-bold tracking-tight leading-tight">Order #{order.id}</h2>
              <p className="text-xs text-slate-500">{order.date}</p>
            </div>
          </div>
          <button
            onClick={() => dispatch(fetchOrders(userRole === 'admin' ? undefined : profile.phone))}
            disabled={loading}
            className={`size-10 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors ${loading ? 'opacity-50' : ''}`}
          >
            <span className={`material-symbols-outlined text-primary ${loading ? 'animate-spin' : ''}`}>refresh</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6 overflow-y-auto pb-36">
        {/* Status Card */}
        <section className="bg-white rounded-xl p-4 shadow-sm border border-primary/10">
          <div className="flex items-center gap-3">
            <div className={`size-12 rounded-full ${statusCfg.bg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${statusCfg.text} text-2xl`}>{statusCfg.icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">{statusCfg.label}</h3>
              <p className="text-sm text-slate-500">Pedido en FlashDrop</p>
            </div>
          </div>

          {/* Progress bar — only for non-cancelled */}
          {currentStatus !== 'Cancelled' && (
            <StatusTracker status={currentStatus} variant="full" />
          )}

          {/* Cancellation reason */}
          {currentStatus === 'Cancelled' && order.cancellationReason && (
            <div className="mt-3 pt-3 border-t border-red-100">
              <p className="text-xs text-slate-500 font-semibold mb-1">Razón de cancelación:</p>
              <p className="text-sm text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2">
                {order.cancellationReason}
              </p>
            </div>
          )}
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
            
            {/* Map Preview */}
            <div className="w-full mt-3 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-inner relative pointer-events-none" style={{ height: '200px' }}>
              <iframe
                title="Google Maps Preview"
                style={{ 
                  position: 'absolute', 
                  top: '-250px', 
                  left: '-250px', 
                  width: 'calc(100% + 500px)', 
                  height: 'calc(100% + 500px)',
                  border: 0 
                }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(order.deliveryAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              />
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 mt-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-200 shadow-sm"
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
      {userRole === 'admin' && !isTerminal && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 max-w-2xl mx-auto">
          <div className="flex gap-3">
            {/* Next step button */}
            {nextStatus && (
              <button
                onClick={() => setPendingStatus(nextStatus)}
                className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary text-slate-900 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">{NEXT_STEP_ICON[currentStatus] || 'arrow_forward'}</span>
                {NEXT_STEP_LABEL[currentStatus] || 'Siguiente'}
              </button>
            )}
            {/* Cancel button — always visible */}
            <button
              onClick={() => setPendingStatus('Cancelled')}
              className={`py-3 px-4 rounded-xl font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5 border border-red-100 ${nextStatus ? 'w-auto' : 'flex-1'}`}
            >
              <span className="material-symbols-outlined text-[20px]">cancel</span>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleDismiss}
          />
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            {pendingStatus === 'Cancelled' ? (
              /* Cancellation modal with preset reasons */
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">cancel</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Cancelar pedido</h3>
                    <p className="text-sm text-slate-500">Esta acción no se puede deshacer.</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">
                    Razón de cancelación <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[...CANCEL_REASONS, 'Otra razón'].map(reason => (
                      <button
                        key={reason}
                        onClick={() => {
                          setSelectedReason(reason === 'Otra razón' ? 'Otra' : reason);
                          if (reason !== 'Otra razón') setCustomReason('');
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          (reason === 'Otra razón' ? selectedReason === 'Otra' : selectedReason === reason)
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-500'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>

                  {selectedReason === 'Otra' && (
                    <textarea
                      value={customReason}
                      onChange={e => setCustomReason(e.target.value)}
                      placeholder="Describe la razón de cancelación..."
                      rows={2}
                      autoFocus
                      className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-red-300 bg-slate-50"
                    />
                  )}

                  {!finalReason && (
                    <p className="text-xs text-red-400 mt-2">Selecciona o escribe una razón</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDismiss}
                    disabled={isSaving}
                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handleConfirmStatus}
                    disabled={isSaving || !finalReason}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <span className="block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : 'Confirmar'}
                  </button>
                </div>
              </div>
            ) : (
              /* Next step modal */
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`size-16 rounded-full flex items-center justify-center ${STATUS_CONFIG[pendingStatus].bg}`}>
                  <span className={`material-symbols-outlined text-3xl ${STATUS_CONFIG[pendingStatus].text}`}>
                    {STATUS_CONFIG[pendingStatus].icon}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {NEXT_STEP_LABEL[currentStatus]}
                  </h3>
                  <p className="text-slate-500 mt-2 text-sm">
                    El pedido pasará a <span className="font-bold">{STATUS_CONFIG[pendingStatus].label}</span>
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-4">
                  <button
                    onClick={handleDismiss}
                    disabled={isSaving}
                    className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmStatus}
                    disabled={isSaving}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${STATUS_CONFIG[pendingStatus].text.replace('text-', 'bg-').replace('-600', '-600').replace('-500', '-500')} bg-primary text-slate-900`}
                  >
                    {isSaving ? (
                      <span className="block w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    ) : 'Confirmar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
