import React, { useState } from 'react';
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
  const [searchPhone, setSearchPhone] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const isPhoneSet = profile.phone.trim() !== '';
  const isProfileComplete = isPhoneSet && profile.name.trim() !== '' && profile.address.trim() !== '';

  const isAdmin = auth.isAuthenticated && auth.currentUser?.role === 'admin';
  let filteredHistory = isAdmin
    ? history
    : history.filter(o => o.customerPhone === profile.phone);

  const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  filteredHistory = filteredHistory.filter(o => {
    // Parse the date string saved in checkout, e.g. "Oct 24, 2023, 10:30 AM"
    const orderTime = new Date(o.date).getTime();
    return orderTime >= twentyFourHoursAgo;
  });

  if (activeTab !== 'All Orders') {
    filteredHistory = filteredHistory.filter(o => o.status.toLowerCase() === activeTab.toLowerCase());
  }

  if (searchPhone.trim()) {
    filteredHistory = filteredHistory.filter(o => o.customerPhone && o.customerPhone.includes(searchPhone.trim()));
  }

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
            <div className="size-10 flex items-center justify-center rounded-full bg-primary/10">
              <span className="material-symbols-outlined">arrow_back</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Order History</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className={`size-10 flex items-center justify-center rounded-full ${showSearch ? 'bg-primary text-slate-900' : 'bg-primary/10'}`}
            >
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="size-10 flex items-center justify-center rounded-full bg-primary/10">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>
        
        {showSearch && (
          <div className="px-4 pb-2 animate-in fade-in slide-in-from-top-2">
            <input 
              type="text" 
              placeholder="Search by phone number..." 
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-xl py-2 px-4 shadow-inner text-sm focus:ring-2 focus:ring-primary outline-none"
            />
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
          <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">Sorted by Date</span>
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

            return (
              <div key={order.id} className="bg-white rounded-xl border border-primary/10 overflow-hidden shadow-sm transition-all duration-300">
              <div className="p-4 flex gap-4">
                  <div className="size-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                    <span className="material-symbols-outlined text-slate-400 text-2xl">receipt_long</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider">Order #{order.id}</p>
                        <h4 className="text-lg font-bold leading-none mt-1">{order.status}</h4>
                        <p className="text-sm text-slate-500 mt-1">{order.date}</p>
                      </div>
                      <span className="text-lg font-bold text-primary">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium text-slate-900">Items:</span> {order.items.reduce((acc, item) => acc + item.quantity, 0)} {!isExpanded && `(${order.items.map(i => i.name).join(', ')})`}
                      </p>
                      <button 
                        onClick={() => toggleOrder(order.id)}
                        className="p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                      >
                        <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="pt-2 mt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between items-center px-1">
                              <span className="text-sm text-slate-600 truncate mr-2">{item.name}</span>
                              <div className="text-sm text-slate-500 whitespace-nowrap">
                                x{item.quantity} <span className="font-semibold text-slate-700 ml-1">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 text-slate-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="material-symbols-outlined text-sm">map</span> Map
                      </a>
                      <button 
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-slate-900 hover:bg-primary/90 transition-colors flex items-center gap-1"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
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
