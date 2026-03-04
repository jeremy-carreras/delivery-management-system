import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState, UserRole } from '../store';
import { useNavigate } from 'react-router-dom';

interface OrderDetailsProps {
  orderId: string;
  userRole: UserRole;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, userRole }) => {
  const navigate = useNavigate();
  const { history } = useSelector((state: RootState) => state.orders);
  const [selectedAction, setSelectedAction] = useState<'Delivered' | 'Cancelled' | 'Other Option' | null>(null);
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
            <div className="size-12 rounded-full bg-green-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-500 text-2xl">check_circle</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{order.status}</h3>
              <p className="text-sm text-slate-500">Thank you for ordering with FlashDrop</p>
            </div>
          </div>
        </section>

        {/* Delivery Details */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-primary px-1">
            <span className="material-symbols-outlined text-lg">local_shipping</span>
            <h3 className="font-bold">Delivery Details</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-slate-400 mt-0.5">person</span>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Recipient</p>
                <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                <p className="text-xs text-slate-600 mt-0.5">{order.customerPhone}</p>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-slate-400 mt-0.5">location_on</span>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-0.5">Address</p>
                <p className="text-sm font-medium text-slate-900 leading-snug">{order.deliveryAddress}</p>
              </div>
            </div>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-2.5 mt-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-200"
            >
              <span className="material-symbols-outlined text-[18px]">map</span> Open in Google Maps
            </a>
          </div>
        </section>

        {/* Order Items */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-primary px-1">
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            <h3 className="font-bold">Order Summary</h3>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover border border-slate-100" referrerPolicy="no-referrer" />
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
                  <p className="text-xs text-slate-500 mt-1">x{item.quantity} • {item.unit || 'Standard'}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 py-0.5">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>${(order.items.reduce((acc, item) => acc + item.price * item.quantity, 0)).toFixed(2)}</span>
              </div>
              {order.total - order.items.reduce((acc, item) => acc + item.price * item.quantity, 0) > 0.01 && (
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Taxes & Fees</span>
                  <span>${(order.total - order.items.reduce((acc, item) => acc + item.price * item.quantity, 0)).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-100">
                <span className="text-slate-900">Total</span>
                <span className="text-yellow-accent">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 flex justify-center gap-6">
        <button 
          onClick={() => setSelectedAction('Delivered')}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="size-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm border border-green-100">
            <span className="material-symbols-outlined text-2xl">done_all</span>
          </div>
          <span className="text-xs font-bold text-slate-700">Delivered</span>
        </button>

        {userRole === 'admin' && (
          <button 
            onClick={() => setSelectedAction('Cancelled')}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="size-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm border border-red-100">
              <span className="material-symbols-outlined text-2xl">cancel</span>
            </div>
            <span className="text-xs font-bold text-slate-700">Cancelled</span>
          </button>
        )}

        <button 
          onClick={() => setSelectedAction('Other Option')}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="size-14 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm border border-slate-200">
            <span className="material-symbols-outlined text-2xl">more_horiz</span>
          </div>
          <span className="text-xs font-bold text-slate-700">Other</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedAction(null)}
          ></div>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`size-16 rounded-full flex items-center justify-center ${
                selectedAction === 'Delivered' ? 'bg-green-100 text-green-600' :
                selectedAction === 'Cancelled' ? 'bg-red-100 text-red-500' :
                'bg-slate-100 text-slate-600'
              }`}>
                <span className="material-symbols-outlined text-3xl">
                  {selectedAction === 'Delivered' ? 'done_all' : selectedAction === 'Cancelled' ? 'cancel' : 'help'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedAction === 'Other Option' ? 'Other Action' : `Mark as ${selectedAction}`}
                </h3>
                <p className="text-slate-500 mt-2 text-sm">
                  ¿Estás seguro que quieres marcar este pedido como {selectedAction.toLowerCase()}?
                </p>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button 
                  onClick={() => setSelectedAction(null)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => setSelectedAction(null)}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-colors ${
                    selectedAction === 'Delivered' ? 'bg-green-600 hover:bg-green-700' :
                    selectedAction === 'Cancelled' ? 'bg-red-500 hover:bg-red-600' :
                    'bg-slate-800 hover:bg-slate-900'
                  }`}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
