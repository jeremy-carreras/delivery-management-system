import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, clearCart, createOrderEntry, Order, AppDispatch } from '../store';
import { Button } from 'primereact/button';

import { useNavigate } from 'react-router-dom';

interface CheckoutProps {}

export const Checkout: React.FC<CheckoutProps> = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((state: RootState) => state.profile);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = import.meta.env.VITE_ENABLE_DELIVERY_FEE === 'true' ? 2.99 : 0;
  const total = subtotal + deliveryFee;

  const addressParts = profile.address?.split(',') || [];
  const shortAddress = addressParts[0] || 'Desconocido';
  const restAddress = addressParts.slice(1).join(',').trim() || '';

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [notes, setNotes] = React.useState('');
  const [notesOpen, setNotesOpen] = React.useState(false);

  const handleConfirmOrder = () => {
    setIsSubmitting(true);
    const newOrder: Order = {
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      items: [...cartItems],
      total,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      customerName: profile.name,
      customerPhone: profile.phone,
      deliveryAddress: profile.address,
      notes: notes.trim() || undefined,
      status: 'Pending',
    };

    dispatch(createOrderEntry(newOrder)).then(() => {
      setIsSubmitting(false);
      dispatch(clearCart());
      navigate('/orders');
    }).catch(() => {
      setIsSubmitting(false);
      // Handle error natively if desired
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light max-w-2xl mx-auto">
      <header className="flex items-center p-4 gap-4 sticky top-0 bg-background-light/80 backdrop-blur-md z-10">
        <button onClick={() => navigate('/cart')} className="p-2 rounded-full bg-white shadow-sm">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-bold">Pagar</h2>
      </header>

      <main className="flex-1 p-4 space-y-6 overflow-y-auto">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined">local_shipping</span>
            <h3 className="font-bold">Detalles de Entrega</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Nombre de quien recibe</label>
              <div className="relative">
                <input type="text" value={profile.name || ''} readOnly className="w-full rounded-xl border-none outline-none bg-slate-100 shadow-sm py-3 px-4 text-slate-900" />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary">check_circle</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Dirección de Entrega</label>
              <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">location_on</span>
                  <p className="text-sm font-medium truncate" title={profile.address}>
                    {profile.address || 'Dirección no configurada'}
                  </p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-3 overflow-hidden">
                  <span className="material-symbols-outlined text-primary shrink-0">near_me</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{shortAddress}</p>
                    <p className="text-[10px] text-slate-500 truncate">{restAddress}</p>
                  </div>
                </div>
                <p className="text-[10px] text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check_circle</span> Ubicación precisa encontrada
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined">receipt_long</span>
            <h3 className="font-bold">Resumen del Pedido</h3>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NiZDVlMSI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjFmNWY5Ii8+PHBhdGggZD0iTTIxIDE5VjVjMC0xLjEtLjktMi0yLTJINWMtMS4xIDAtMiAuOS0yIDJ2MTRjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMnpNOC41IDEzLjVsMi41IDMuMDFMMTQuNSAxMmw0LjUgNkg1bDMuNS00LjV6Ii8+PC9zdmc+'; }} />
                <div className="flex-1">
                  <h4 className="text-sm font-bold">{item.name}</h4>
                  <p className="text-xs text-slate-400">x{item.quantity} • Estándar</p>
                </div>
                <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-50 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Costo de Envío</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Notes Section */}
        <section className="space-y-4">
          <button
            type="button"
            onClick={() => setNotesOpen(o => !o)}
            className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2 text-slate-700">
              <span className="material-symbols-outlined text-primary">edit_note</span>
              <span className="font-semibold text-sm">Especificaciones de tu pedido</span>
              {notes.trim() && <span className="size-2 rounded-full bg-primary shrink-0" />}
            </div>
            <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${notesOpen ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          {notesOpen && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Indicaciones extras, quitar ingredientes, etc."
                rows={3}
                autoFocus
                maxLength={400}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
              <p className="text-[10px] text-slate-400 text-right mt-1 pr-1">{notes.length}/400</p>
            </div>
          )}
        </section>

        {/*<section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Payment</h3>
            <button className="text-primary text-xs font-bold">Change</button>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-600">credit_card</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Mastercard •••• 4242</p>
              <p className="text-xs text-slate-400">Expires 12/26</p>
            </div>
            <span className="material-symbols-outlined text-primary">check_circle</span>
          </div>
        </section>*/}
      </main>

      <footer className="p-6 bg-white border-t border-slate-100 flex flex-col items-center gap-4">
        <Button 
          onClick={handleConfirmOrder}
          disabled={cartItems.length === 0 || isSubmitting}
          className="w-full bg-primary hover:bg-primary/90 text-background-dark py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 border-none disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="block w-6 h-6 border-2 border-background-dark border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Confirmar Pedido • ${total.toFixed(2)} <span className="material-symbols-outlined">arrow_forward</span>
            </>
          )}
        </Button>
        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest">
          Al hacer tu pedido aceptas nuestros términos de servicio
        </p>
      </footer>
    </div>
  );
};
