import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, fetchOrders } from '../store';
import { useNavigate } from 'react-router-dom';
import { ProfileModal } from './ProfileModal';
import { StatusTracker } from './StatusTracker';

interface OrdersProps {}

export const Orders: React.FC<OrdersProps> = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { history, loading } = useSelector((state: RootState) => state.orders);
  const auth = useSelector((state: RootState) => state.auth);
  const profile = useSelector((state: RootState) => state.profile);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const isPreparador = auth.currentUser?.role === 'preparador';
  const isRepartidor = auth.currentUser?.role === 'repartidor';
  const defaultTab = isPreparador ? 'Preparando' : isRepartidor ? 'En reparto' : 'All Orders';
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
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
    return d.toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
  };
  const isPhoneSet = profile.phone.trim() !== '';
  const isProfileComplete = isPhoneSet && profile.name.trim() !== '' && profile.address.trim() !== '';

  const isAdmin = auth.isAuthenticated && auth.currentUser?.role === 'admin';
  const isStaff = auth.isAuthenticated && ['admin', 'repartidor', 'preparador'].includes(auth.currentUser?.role || '');

  const POLLING_INTERVAL = Number(import.meta.env.VITE_POLLING_INTERVAL) || 30000;

  React.useEffect(() => {
    const triggerFetch = () => {
      if (isStaff || isPhoneSet) {
        dispatch(fetchOrders({
          phone: (isAdmin || auth.currentUser?.role === 'repartidor' || auth.currentUser?.role === 'preparador') ? undefined : profile.phone,
          userId: auth.currentUser?.id,
          userRole: auth.currentUser?.role,
        }));
      }
    };

    triggerFetch();

    const intervalId = setInterval(triggerFetch, POLLING_INTERVAL);
    return () => clearInterval(intervalId);
  }, [dispatch, isStaff, isAdmin, isPhoneSet, profile.phone, auth.currentUser, POLLING_INTERVAL]);

  let filteredHistory = (isAdmin || auth.currentUser?.role === 'repartidor' || auth.currentUser?.role === 'preparador')
    ? history
    : history.filter(o => o.customerPhone === profile.phone);

  filteredHistory = filteredHistory.filter(o => {
    const orderTime = new Date(o.date).getTime();
    const from = filterFrom ? new Date(filterFrom).getTime() : 0;
    const to = filterTo ? new Date(filterTo).getTime() : Infinity;
    return orderTime >= from && orderTime <= to;
  });

  if (activeTab !== 'All Orders') {
    filteredHistory = filteredHistory.filter(o => o.status === activeTab);
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
        isOpen={!isPhoneSet && !isStaff} 
        phoneOnly={true}
        requireClose={true} 
      />
      
      <header className="sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight">Historial de Pedidos</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => dispatch(fetchOrders({
                phone: (isAdmin || auth.currentUser?.role === 'repartidor' || auth.currentUser?.role === 'preparador') ? undefined : profile.phone,
                userId: auth.currentUser?.id,
                userRole: auth.currentUser?.role,
              }))}
              disabled={loading}
              className={`size-10 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors ${loading ? 'opacity-50' : ''}`}
            >
              <span className={`material-symbols-outlined text-primary ${loading ? 'animate-spin' : ''}`}>refresh</span>
            </button>
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
                className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 whitespace-nowrap text-sm font-bold ${
                  activeTab === tab ? 'border-primary text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
                } transition-colors`}
              >
                {displayTabInfo[tab] || tab}
              </button>
            )})}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">Actividad Reciente</h3>
          <button
            onClick={() => setSortAsc(prev => !prev)}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
          >
            <span className={`material-symbols-outlined text-[16px] transition-transform ${sortAsc ? '' : 'rotate-180'}`}>arrow_upward</span>
            {sortAsc ? 'Más antiguas' : 'Más recientes'}
          </button>
        </div>

        {(loading && history.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-3">refresh</span>
            <h3 className="font-bold text-lg text-slate-700">Cargando pedidos...</h3>
            <p className="text-slate-500 text-sm mt-1">Conectando con el servidor</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-primary/10 shadow-sm mt-4">
            <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-4xl text-slate-300">receipt_long</span>
            </div>
            <h3 className="font-bold text-lg">Aún no hay pedidos</h3>
            <p className="text-slate-500 text-sm mt-1">Cuando hagas un pedido, aparecerá aquí.</p>
          </div>
        ) : (
          filteredHistory.map(order => {
            const isExpanded = expandedOrderId === order.id;

            const statusColors: Record<string, string> = {
              Pending:      'bg-yellow-50 text-yellow-600',
              Accepted:     'bg-blue-50 text-blue-600',
              Preparando:   'bg-orange-50 text-orange-500',
              'En reparto': 'bg-purple-600 text-slate-900',
              Entregado:    'bg-green-50 text-green-600',
              Cancelled:    'bg-red-50 text-red-500',
            };
            const statusLabels: Record<string, string> = {
              Pending:      'Pendiente',
              Accepted:     'Aceptado',
              Preparando:   'En preparación',
              'En reparto': 'En reparto',
              Entregado:    'Entregado',
              Cancelled:    'Cancelado',
            };
            const statusColor = statusColors[order.status] || 'bg-slate-100 text-slate-600';
            const statusLabel = statusLabels[order.status] || order.status;

            return (
              <div key={order.id} className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-sm">

                {/* ── MOBILE: stacked layout ── */}
                <div className={isStaff ? 'sm:hidden' : ''}>
                  <div className="p-4 flex gap-3">
                    <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 mt-0.5">
                      <span className="material-symbols-outlined text-slate-400 text-xl">receipt_long</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-primary uppercase tracking-wider truncate">#{order.id}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {order.date ? new Date(order.date).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-slate-900 ml-2 shrink-0">${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <div className="flex flex-col min-w-0 pr-4">
                          <h4 className="text-base font-bold text-slate-900 truncate">{order.customerName || '—'}</h4>
                          {(isAdmin || auth.currentUser?.role === 'preparador') && order.repartidor && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full w-max">
                              <span className="material-symbols-outlined text-[12px]">two_wheeler</span>
                              <span className="truncate max-w-[100px]">{order.repartidor.name}</span>
                            </div>
                          )}
                        </div>
                        <span className={`ml-2 shrink-0 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${statusColor} self-start mt-1`}>{statusLabel}</span>
                      </div>
                      {!isStaff && order.status !== 'Cancelled' && (
                        <div className="mt-3 mb-1"><StatusTracker status={order.status as any} variant="compact" /></div>
                      )}
                      {!isStaff && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="material-symbols-outlined text-slate-400 text-[14px]">phone</span>
                          <a href={order.customerPhone ? `tel:${order.customerPhone}` : undefined} className={`text-xs text-slate-500 font-medium ${order.customerPhone ? 'hover:underline text-blue-500' : ''}`}>{order.customerPhone || '—'}</a>
                        </div>
                      )}
                      {!isStaff && (
                        <div className="flex items-start gap-1 mt-1">
                          <span className="material-symbols-outlined text-slate-400 text-[14px] mt-0.5">location_on</span>
                          <p className="mt-2 text-xs text-slate-500 leading-snug line-clamp-1">{order.deliveryAddress || '—'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-4 pb-2 border-t border-slate-100">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <p className="text-xs text-slate-500 truncate flex-1">
                          <span className="font-semibold text-slate-700">{order.items.reduce((acc, i) => acc + i.quantity, 0)}</span> {order.items.reduce((acc, i) => acc + i.quantity, 0) === 1 ? 'producto' : 'productos'}
                          {!isExpanded && order.items.length > 0 && <span className="ml-1 text-slate-400">· {order.items.map(i => i.name).join(', ')}</span>}
                        </p>
                        <button onClick={() => toggleOrder(order.id)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                          <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                      </div>

                      {/* Staff actions next to accordion on mobile (only if screen > 480px) */}
                      {isStaff && (
                        <div className="hidden min-[480px]:flex gap-1.5 ml-2 shrink-0">
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`} target="_blank" rel="noopener noreferrer"
                            className="py-1 px-2.5 text-[12px] font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}>
                            <span className="material-symbols-outlined text-[14px]">map</span> Mapa
                          </a>
                          <button onClick={() => navigate(`/orders/${order.id}`)}
                            className="py-1 px-2.5 text-[12px] font-bold rounded-lg bg-primary text-slate-900 hover:bg-primary/90 transition-colors flex items-center gap-1">
                              Ver detalle
                          </button>
                        </div>
                      )}
                    </div>
                    {isExpanded && (
                      <div className="pb-2 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                        {isStaff && (
                          <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5 border border-slate-100 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-slate-400 text-xs">phone</span>
                              <a href={order.customerPhone ? `tel:${order.customerPhone}` : undefined} className={`text-xs font-bold text-slate-700 ${order.customerPhone ? 'hover:underline text-blue-500' : ''}`}>{order.customerPhone || '—'}</a>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-slate-400 text-xs mt-0.5">location_on</span>
                              <span className="text-xs text-slate-600 leading-relaxed">{order.deliveryAddress || '—'}</span>
                            </div>
                          </div>
                        )}
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center px-1">
                            <span className="text-sm text-slate-600 truncate mr-2">{item.name}</span>
                            <div className="text-sm text-slate-500 whitespace-nowrap shrink-0">
                              x{item.quantity} <span className="font-semibold text-slate-700 ml-1">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                        {order.notes && (
                          <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                            <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5 shrink-0">edit_note</span>
                            <p className="text-xs text-amber-800 leading-relaxed">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions div: visible for clients, or for staff on very small mobile screens */}
                  <div className={`flex gap-2 px-4 pb-4 ${isStaff ? 'min-[480px]:hidden' : ''}`}>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 py-2 text-sm font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1 text-slate-700"
                      onClick={(e) => e.stopPropagation()}>
                      <span className="material-symbols-outlined text-[16px]">map</span> Mapa
                    </a>
                    <button onClick={() => navigate(`/orders/${order.id}`)}
                      className="flex-1 py-2 text-sm font-semibold rounded-lg bg-primary text-slate-900 hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                      Ver detalle
                    </button>
                  </div>
                </div>

                {/* ── INTERMEDIATE: 2 rows layout (staff only, sm to lg) ── */}
                {isStaff && (
                  <div className="hidden sm:flex lg:hidden flex-col gap-3 p-4">
                    {/* Row 1: Info (Dynamic grid to prevent overlap) */}
                    <div className="grid grid-cols-[40px_auto_1fr_auto] items-center gap-x-4 gap-y-2">
                      <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                        <span className="material-symbols-outlined text-slate-400 text-xl">receipt_long</span>
                      </div>
                      <div className="flex flex-col min-w-[120px]">
                        <p className="text-[11px] font-bold text-primary uppercase tracking-wider whitespace-nowrap">#{order.id}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
                          {order.date ? new Date(order.date).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{order.customerName || '—'}</h4>
                        {(isAdmin || auth.currentUser?.role === 'preparador') && order.repartidor && (
                          <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full w-max mt-1">
                            <span className="material-symbols-outlined text-[12px]">two_wheeler</span>
                            <span className="truncate max-w-[120px]">{order.repartidor.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 min-w-[90px]">
                        <p className="text-sm font-bold text-slate-900">${order.total.toFixed(2)}</p>
                        <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
                      </div>
                    </div>
                    
                    {/* Row 2: Products + Actions */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0 mr-4">
                        <p className="text-xs text-slate-600 truncate flex-1">
                          <span className="font-bold text-slate-800">{order.items.reduce((acc, i) => acc + i.quantity, 0)}</span> prod.
                          {!isExpanded && order.items.length > 0 && <span className="ml-1 text-slate-500">· {order.items.map(i => i.name).join(', ')}</span>}
                        </p>
                        <button onClick={() => toggleOrder(order.id)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors shrink-0">
                          <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`} target="_blank" rel="noopener noreferrer"
                          className="py-1.5 px-4 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 text-slate-700 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}>
                          <span className="material-symbols-outlined text-[16px]">map</span> Mapa
                        </a>
                        <button onClick={() => navigate(`/orders/${order.id}`)}
                          className="py-1.5 px-4 text-xs font-semibold rounded-lg bg-primary text-slate-900 hover:bg-primary/90 transition-colors flex items-center gap-1 whitespace-nowrap">
                          Ver detalle
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── DESKTOP: single row layout (staff only, lg+) ── */}
                {isStaff && (
                  <div className="hidden lg:flex items-center gap-4 py-3 px-4">
                    {/* Icon */}
                    <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                      <span className="material-symbols-outlined text-slate-400 text-xl">receipt_long</span>
                    </div>

                    {/* ID + Date */}
                    <div className="w-36 shrink-0">
                      <p className="text-[11px] font-bold text-primary uppercase tracking-wider">#{order.id}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {order.date ? new Date(order.date).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                      </p>
                    </div>

                    {/* Customer + driver */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{order.customerName || '—'}</h4>
                      {(isAdmin || auth.currentUser?.role === 'preparador') && order.repartidor && (
                        <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full w-max mt-1">
                          <span className="material-symbols-outlined text-[12px]">two_wheeler</span>
                          <span className="truncate max-w-[100px]">{order.repartidor.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Products summary + accordion toggle */}
                    <div className="flex-[2] min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-600 truncate flex-1">
                          <span className="font-bold text-slate-800">{order.items.reduce((acc, i) => acc + i.quantity, 0)}</span> prod.
                          {!isExpanded && order.items.length > 0 && <span className="ml-1 text-slate-500">· {order.items.map(i => i.name).join(', ')}</span>}
                        </p>
                        <button onClick={() => toggleOrder(order.id)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors shrink-0">
                          <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                        </button>
                      </div>
                    </div>

                    {/* Total + Status */}
                    <div className="w-30 shrink-0 flex flex-col items-end gap-1">
                      <p className="text-sm font-bold text-slate-900">${order.total.toFixed(2)}</p>
                      <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0 border-l border-slate-100 pl-4">
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`} target="_blank" rel="noopener noreferrer"
                        className="py-2 px-4 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 text-slate-700 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}>
                        <span className="material-symbols-outlined text-[16px]">map</span> Mapa
                      </a>
                      <button onClick={() => navigate(`/orders/${order.id}`)}
                        className="py-2 px-4 text-xs font-semibold rounded-lg bg-primary text-slate-900 hover:bg-primary/90 transition-colors flex items-center gap-1 whitespace-nowrap">
                        Ver detalle
                      </button>
                    </div>
                  </div>
                )}

                {/* Expanded accordion for intermediate/desktop (staff) */}
                {isStaff && isExpanded && (
                  <div className="hidden sm:block px-4 pb-3 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5 border border-slate-100 mt-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-xs">phone</span>
                        <a href={order.customerPhone ? `tel:${order.customerPhone}` : undefined} className={`text-xs font-bold text-slate-700 ${order.customerPhone ? 'hover:underline text-blue-500' : ''}`}>{order.customerPhone || '—'}</a>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-xs mt-0.5">location_on</span>
                        <span className="text-xs text-slate-600 leading-relaxed">{order.deliveryAddress || '—'}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center px-1">
                          <span className="text-sm text-slate-600 truncate mr-2">{item.name}</span>
                          <div className="text-sm text-slate-500 whitespace-nowrap shrink-0">
                            x{item.quantity} <span className="font-semibold text-slate-700 ml-1">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {order.notes && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-2.5 mt-1">
                        <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5 shrink-0">edit_note</span>
                        <p className="text-xs text-amber-800 leading-relaxed">{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })
        )}
      </main>
    </div>
  );
};
