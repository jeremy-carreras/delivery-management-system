import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, updateQuantity, removeFromCart } from '../store';
import { Button } from 'primereact/button';

import { useNavigate } from 'react-router-dom';

interface CartProps {}

export const Cart: React.FC<CartProps> = () => {
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = import.meta.env.VITE_ENABLE_DELIVERY_FEE === 'true' ? 2.99 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-2xl mx-auto">
      <header className="flex items-center justify-between p-4 border-b border-slate-100">
        <button onClick={() => navigate('/')} className="p-2 rounded-full bg-slate-100 shadow-sm">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-xl font-bold">Your Cart</h2>
        <button className="text-red-500 font-semibold text-sm">Clear</button>
      </header>

      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <span className="material-symbols-outlined text-6xl mb-2">shopping_cart</span>
            <p>Your cart is empty</p>
          </div>
        ) : (
          cartItems.map(item => (
            <div key={item.cartItemId} className="flex gap-4 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-20 h-20 object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm">
                      {item.name}
                      {(item.flavors?.length || item.breadType) && (
                        <span className="block text-xs font-normal text-slate-500 mt-1">
                          {item.breadType && <span className="mr-1">{item.breadType}</span>}
                          {item.flavors && item.flavors.length > 0 && `(${item.flavors.join(' & ')})`}
                        </span>
                      )}
                    </h3>
                    <p className="text-yellow-accent font-bold text-sm">${item.price.toFixed(2)}</p>
                  </div>
                  <button onClick={() => dispatch(removeFromCart(item.cartItemId))} className="text-slate-300 hover:text-red-500">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-3 bg-slate-50 rounded-full px-2 py-1">
                    <button 
                      onClick={() => dispatch(updateQuantity({ cartItemId: item.cartItemId, quantity: item.quantity - 1 }))}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="text-sm font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => dispatch(updateQuantity({ cartItemId: item.cartItemId, quantity: item.quantity + 1 }))}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-primary text-white shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                  <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {cartItems.length > 0 && (
        <footer className="p-6 bg-slate-50 rounded-t-3xl space-y-4 shadow-2xl">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between text-sm text-slate-500">
                <span>Delivery Fee</span>
                <span className="font-bold text-slate-900">${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg pt-2 border-t border-slate-200">
              <span className="font-bold">Total</span>
              <span className="font-bold text-yellow-accent text-2xl">${total.toFixed(2)}</span>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-primary hover:bg-primary/90 text-background-dark py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 border-none"
          >
            Proceed to Checkout <span className="material-symbols-outlined">arrow_forward</span>
          </Button>
        </footer>
      )}
    </div>
  );
};
