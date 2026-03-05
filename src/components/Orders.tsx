import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { ProfileModal } from './ProfileModal';

interface OrdersProps {}

export const Orders: React.FC<OrdersProps> = () => {
  const navigate = useNavigate();
  const { history } = useSelector((state: RootState) => state.orders);
  const auth = useSelector((state: RootState) => state.auth);
  const profile = useSelector((state: RootState) => state.profile);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Default: last 24h
  const default24hFrom = () => {
    const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  };
  const defaultTo = () => new Date().toISOString().slice(0, 16);

  const [filterFrom, setFilterFrom] = useState(default24hFrom);
  const [filterTo, setFilterTo] = useState(defaultTo);

  const isFilterDefault = filterFrom === default24hFrom() && filterTo === defaultTo();

  const filterFromRef = useRef<HTMLInputElement>(null);
  const filterToRef = useRef<HTMLInputElement>(null);

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };
  const isPhoneSet = profile.phone.trim() !== '';
  const isProfileComplete = isPhoneSet && profile.name.trim() !== '' && profile.address.trim() !== '';

  const isAdmin = auth.isAuthenticated && auth.currentUser?.role === 'admin';
  let filteredHistory = isAdmin
    ? history
    : history.filter(o => o.customerPhone === profile.phone);

  filteredHistory = filteredHistory.filter(o => {
    const orderTime = new Date(o.date).getTime();
    const from = filterFrom ? new Date(filterFrom).getTime() : 0;
    const to = filterTo ? new Date(filterTo).getTime() : Infinity;
    return orderTime >= from && orderTime <= to;
  });

  if (activeTab !== 'All Orders') {
    filteredHistory = filteredHistory.filter(o => o.status.toLowerCase() === activeTab.toLowerCase());
  }

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filteredHistory = filteredHistory.filter(o =>
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.customerPhone && o.customerPhone.includes(q)) ||
      (o.deliveryAddress && o.deliveryAddress.toLowerCase().includes(q))
    );
  }

  const [sortAsc, setSortAsc] = useState(false); // false = newest first

  filteredHistory = [...filteredHistory].sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    return sortAsc ? ta - tb : tb - ta;
  });

  const toggleOrder = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background-light">
      <ProfileModal 
        isOpen={!isPhoneSet && !isAdmin} 
        phoneOnly={true}
        requireClose={true} 
      />
      
      <header className="sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">Order History</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className={`size-10 flex items-center justify-center rounded-full ${showSearch ? 'bg-primary text-slate-900' : 'bg-primary/10'}`}
            >
              <span className="material-symbols-outlined">search</span>
            </button>
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={`size-10 flex items-center justify-center rounded-full ${showFilter || !isFilterDefault ? 'bg-primary text-slate-900' : 'bg-primary/10'}`}
            >
              <span className="material-symbols-outlined">calendar_month</span>
            </button>
          </div>
        </div>
        
        {showSearch && (
          <div className="px-4 pb-2 animate-in fade-in slide-in-from-top-2">
            <input 
              type="text" 
              placeholder="Buscar por nombre, teléfono o dirección..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl py-2 px-4 shadow-inner text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        )}

        {showFilter && (
          <div className="px-4 pb-3 pt-1 animate-in fade-in slide-in-from-top-2 border-b border-slate-100">
            <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-3 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtrar por fecha y hora</p>
              <div className="grid grid-cols-2 gap-2">
                {/* FROM picker */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Desde</label>
                  <div
                    className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => filterFromRef.current?.showPicker()}
                  >
                    <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                    <span className="text-xs font-semibold text-slate-700 flex-1">{formatDate(filterFrom)}</span>
                    <input
                      ref={filterFromRef}
                      type="datetime-local"
                      value={filterFrom}
                      onChange={e => setFilterFrom(e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                </div>
                {/* TO picker */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Hasta</label>
                  <div
                    className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => filterToRef.current?.showPicker()}
                  >
                    <span className="material-symbols-outlined text-primary text-[18px]">event</span>
                    <span className="text-xs font-semibold text-slate-700 flex-1">{formatDate(filterTo)}</span>
                    <input
                      ref={filterToRef}
                      type="datetime-local"
                      value={filterTo}
                      onChange={e => setFilterTo(e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => { setFilterFrom(default24hFrom()); setFilterTo(defaultTo()); }}
                className="w-full py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                Restablecer (últimas 24h)
              </button>
            </div>
          </div>
        )}

        <div className="px-4">
          <div className="flex gap-8 overflow-x-auto no-scrollbar">
            {['All Orders', 'Active', 'Completed', 'Cancelled'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 whitespace-nowrap text-sm font-bold ${
                  activeTab === tab ? 'border-primary text-slate-900' : 'border-transparent text-slate-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">Recent Activity</h3>
          <button
            onClick={() => setSortAsc(prev => !prev)}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
          >
            <span className={`material-symbols-outlined text-[16px] transition-transform ${sortAsc ? '' : 'rotate-180'}`}>arrow_upward</span>
            {sortAsc ? 'Más antiguas' : 'Más recientes'}
          </button>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-primary/10 shadow-sm mt-4">
            <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
            </div>
            <h3 className="font-bold text-lg">No orders yet</h3>
            <p className="text-slate-500 text-sm mt-1">When you place an order, it will appear here.</p>
          </div>
        ) : (
          filteredHistory.map(order => {
            const isExpanded = expandedOrderId === order.id;

            const statusColors: Record<string, string> = {
              Active: 'bg-blue-50 text-blue-600',
              Completed: 'bg-green-50 text-green-600',
              Cancelled: 'bg-red-50 text-red-500',
              Pending: 'bg-yellow-50 text-yellow-600',
            };
            const statusColor = statusColors[order.status] || 'bg-slate-100 text-slate-600';

            return (
              <div key={order.id} className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-sm">
                {/* Card header — always visible */}
                <div className="p-4 flex gap-3">
                  <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 mt-0.5">
                    <span className="material-symbols-outlined text-slate-400 text-xl">receipt_long</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Row 1: Order ID + date/time + Total */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-wider truncate">#{order.id}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {order.date ? new Date(order.date).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-slate-900 ml-2 shrink-0">${order.total.toFixed(2)}</span>
                    </div>
                    {/* Row 2: Customer name + status badge */}
                    <div className="flex items-center justify-between mt-0.5">
                      <h4 className="text-base font-bold text-slate-900 truncate">{order.customerName || '—'}</h4>
                      <span className={`ml-2 shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${statusColor}`}>{order.status}</span>
                    </div>
                    {/* Row 3: Phone */}
                    <div className="flex items-center gap-1 mt-1">
                      <span className="mt-1 material-symbols-outlined text-slate-400 text-[14px]">phone</span>
                      <p className="text-xs text-slate-500 font-medium">{order.customerPhone || '—'}</p>
                    </div>
                    {/* Row 4: Address truncated */}
                    <div className="flex items-start gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-slate-400 text-[14px] mt-0.5">location_on</span>
                      <p className=" mt-2 text-xs text-slate-500 leading-snug line-clamp-1">{order.deliveryAddress || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Expandable items section */}
                <div className="px-4 pb-2 border-t border-slate-100">
                  <div className="flex items-center justify-between py-2">
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</span> {order.items.reduce((acc, item) => acc + item.quantity, 0) === 1 ? 'producto' : 'productos'}
                      {!isExpanded && order.items.length > 0 && <span className="ml-1 text-slate-400">· {order.items.map(i => i.name).join(', ')}</span>}
                    </p>
                    <button
                      onClick={() => toggleOrder(order.id)}
                      className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                      <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="pb-2 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center px-1">
                          <span className="text-sm text-slate-600 truncate mr-2">{item.name}</span>
                          <div className="text-sm text-slate-500 whitespace-nowrap shrink-0">
                            x{item.quantity} <span className="font-semibold text-slate-700 ml-1">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 px-4 pb-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 text-sm font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 text-slate-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="material-symbols-outlined text-[16px]">map</span> Mapa
                  </a>
                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="flex-1 py-2 text-sm font-semibold rounded-lg bg-primary text-slate-900 hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            );
          })
        )}

        <div className="flex justify-center py-4">
          <button className="flex items-center gap-2 text-primary font-bold hover:underline">
            <span>Load Older Orders</span>
            <span className="material-symbols-outlined">expand_more</span>
          </button>
        </div>
      </main>
    </div>
  );
};
