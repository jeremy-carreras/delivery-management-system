import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, addToCart, setProfile } from '../store';
import { Button } from 'primereact/button';
import { motion, AnimatePresence } from 'motion/react';
import { AddressInput } from './AddressInput';
import { useNavigate } from 'react-router-dom';

interface HomeProps {}

export const Home: React.FC<HomeProps> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const profile = useSelector((state: RootState) => state.profile);
  const [draftName, setDraftName] = React.useState(profile.name);
  const [draftPhone, setDraftPhone] = React.useState(profile.phone);
  const [draftAddress, setDraftAddress] = React.useState(profile.address);
  const [isAddressSelected, setIsAddressSelected] = React.useState(!!profile.address);
  
  const [selectedBakeryProduct, setSelectedBakeryProduct] = React.useState<any | null>(null);
  const [selectedFlavors, setSelectedFlavors] = React.useState<string[]>([]);
  const [selectedBreadType, setSelectedBreadType] = React.useState<string | null>(null);
  const { products, bakeryFlavors, breadTypes, categories: menuCategories } = useSelector((state: RootState) => state.menu);

  // Update drafts if profile changes
  React.useEffect(() => {
    setDraftName(profile.name);
    setDraftPhone(profile.phone);
    setDraftAddress(profile.address);
    setIsAddressSelected(!!profile.address);
  }, [profile]);

  const categoryNames = ['All', ...menuCategories.map(c => c.name)];

  const filteredProducts = products.filter(p => {
    if (p.isAvailable === false) return false;
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: any) => {
    if (!profile.name.trim() || !profile.address.trim()) {
      setShowProfileModal(true);
      return;
    }
    const cat = menuCategories.find(c => c.name === product.category);
    if (cat && cat.type === 'Custom') {
      setSelectedBakeryProduct(product);
      setSelectedFlavors([]);
      setSelectedBreadType(null);
      return;
    }
    dispatch(addToCart(product));
  };

  const handleSaveProfile = () => {
    if (!draftName.trim() || !draftPhone.trim() || !isAddressSelected) return;
    dispatch(setProfile({ name: draftName.trim(), phone: draftPhone.trim(), address: draftAddress.trim() }));
    setShowProfileModal(false);
  };

  return (
    <div className="px-4 py-6">
      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4"
            >
              <h2 className="text-xl font-bold">Complete your profile</h2>
              <p className="text-sm text-slate-500">Fill in your details to continue</p>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    placeholder="e.g. John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
                  <input
                    type="text"
                    value={draftPhone}
                    onChange={(e) => setDraftPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    placeholder="e.g. 555-1234"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Delivery Address</label>
                <AddressInput
                  value={draftAddress}
                  onChange={(val) => {
                    setDraftAddress(val);
                    setIsAddressSelected(false);
                  }}
                  onSelect={() => setIsAddressSelected(true)}
                  placeholder="e.g. 123 Main St"
                  bgClass="bg-slate-50"
                />
              </div>
              
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={!draftName.trim() || !draftPhone.trim() || !isAddressSelected}
                  className="flex-1 py-3 bg-primary text-background-dark hover:bg-primary/90 rounded-xl font-bold text-sm disabled:opacity-50 transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bakery Flavor Modal */}
      <AnimatePresence>
        {selectedBakeryProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold leading-tight">Customize your {selectedBakeryProduct.name.toLowerCase()}</h2>
              
              <div>
                <p className="text-sm font-bold text-slate-700 mt-2">1. Pick bread type</p>
                <div className="space-y-2 mt-2">
                  {breadTypes.map(bType => {
                    const isSelected = selectedBreadType === bType;
                    return (
                      <button
                        key={bType}
                        onClick={() => setSelectedBreadType(bType)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                          isSelected 
                            ? 'border-primary bg-primary/10 text-slate-900' 
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="font-semibold text-sm">{bType}</span>
                        {isSelected && <span className="material-symbols-outlined text-primary text-xl">radio_button_checked</span>}
                        {!isSelected && <span className="material-symbols-outlined text-slate-300 text-xl">radio_button_unchecked</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-700">2. Pick flavors (Required, max 2)</p>
                <div className="space-y-2 mt-2">
                  {bakeryFlavors.map(flavor => {
                    const isSelected = selectedFlavors.includes(flavor);
                    const canSelect = isSelected || selectedFlavors.length < 2;
                    
                    return (
                      <button
                        key={flavor}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedFlavors(prev => prev.filter(f => f !== flavor));
                          } else if (canSelect) {
                            setSelectedFlavors(prev => [...prev, flavor]);
                          }
                        }}
                        disabled={!canSelect && !isSelected}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border ${
                          isSelected 
                            ? 'border-primary bg-primary/10 text-slate-900' 
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        } ${!canSelect && !isSelected ? 'opacity-50 cursor-not-allowed border-slate-100' : 'transition-colors'}`}
                      >
                        <span className="font-semibold text-sm">{flavor}</span>
                        {isSelected && <span className="material-symbols-outlined text-primary text-xl">check_circle</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => setSelectedBakeryProduct(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedBreadType || selectedFlavors.length === 0}
                  onClick={() => {
                    dispatch(addToCart({ 
                      ...selectedBakeryProduct, 
                      flavors: selectedFlavors.length > 0 ? selectedFlavors : undefined,
                      breadType: selectedBreadType!
                    }));
                    setSelectedBakeryProduct(null);
                  }}
                  className="flex-1 py-3 bg-primary text-background-dark hover:bg-primary/90 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mb-6">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input
          className="w-full bg-white border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary text-sm shadow-sm"
          placeholder="Search for food, groceries..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {categoryNames.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-5 py-2 rounded-full font-semibold text-sm transition-colors ${
              activeCategory === cat
                ? 'bg-yellow-accent text-slate-900'
                : 'bg-white text-slate-600 border border-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* <h2 className="text-lg font-bold mb-4">Fresh Picks</h2>*/}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
            <div className="relative aspect-square">
              <img
                className="w-full h-full object-cover"
                src={product.image}
                alt={product.name}
                referrerPolicy="no-referrer"
              />
              {/*<button className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-lg">favorite</span>
              </button>*/}
            </div>
            <div className="p-3 flex flex-col flex-1">
              <h3 className="font-bold text-sm leading-tight mb-1">{product.name}</h3>
              <p className="text-xs text-slate-500 mb-3">{product.unit}</p>
              <div className="mt-auto">
                <p className="text-yellow-accent font-bold mb-2">${product.price.toFixed(2)}</p>
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-primary/10 hover:bg-primary text-background-dark py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 border-none shadow-none"
                >
                  <span className="material-symbols-outlined text-sm">add</span> Add
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
