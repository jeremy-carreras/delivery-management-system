import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, addProduct, updateProduct, deleteProduct, addFlavor, deleteFlavor, addBreadType, deleteBreadType, addCategory, deleteCategory, renameCategory, updateCategoryType, Product } from '../store';
import { Category } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface MenuAdminProps {}

export const MenuAdmin: React.FC<MenuAdminProps> = () => {
  const { products, bakeryFlavors, breadTypes, categories } = useSelector((state: RootState) => state.menu);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'products' | 'flavors' | 'breadTypes' | 'categories'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  
  // Product Form state
  const formRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [draftProduct, setDraftProduct] = useState<Partial<Product>>({
    name: '', price: 0, unit: '', category: 'Groceries', image: '', isAvailable: true
  });

  const [newFlavor, setNewFlavor] = useState('');
  const [newBreadType, setNewBreadType] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'Normal' | 'Custom'>('Normal');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const handleSaveProduct = () => {
    setFormError(null);
    if (!draftProduct.name || draftProduct.name.trim() === '') {
      setFormError('Product name is required');
      return;
    }
    if (!draftProduct.price || draftProduct.price <= 0) {
      setFormError('Please enter a valid price greater than 0');
      return;
    }
    if (!draftProduct.unit || draftProduct.unit.trim() === '') {
      setFormError('Please enter a unit (e.g., 1kg, 2 units)');
      return;
    }
    
    const imageUrl = draftProduct.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800';

    if (editingId) {
      dispatch(updateProduct({ ...draftProduct, image: imageUrl, id: editingId } as Product));
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      dispatch(addProduct({ ...draftProduct, image: imageUrl, isAvailable: draftProduct.isAvailable ?? true, id: newId } as Product));
    }
    setEditingId(null);
    setDraftProduct({ name: '', price: 0, unit: '', category: 'Groceries', image: '', isAvailable: true });
    setIsFormExpanded(false);
  };

  const handleEditProduct = (p: Product) => {
    setFormError(null);
    setEditingId(p.id);
    setDraftProduct(p);
    setIsFormExpanded(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleAddFlavor = () => {
    if (newFlavor.trim() && !bakeryFlavors.includes(newFlavor.trim())) {
      dispatch(addFlavor(newFlavor.trim()));
      setNewFlavor('');
    }
  };

  const handleAddBreadType = () => {
    if (newBreadType.trim() && !breadTypes.includes(newBreadType.trim())) {
      dispatch(addBreadType(newBreadType.trim()));
      setNewBreadType('');
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.find(c => c.name === newCategory.trim())) {
      dispatch(addCategory({ name: newCategory.trim(), type: newCategoryType }));
      setNewCategory('');
      setNewCategoryType('Normal');
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col min-h-screen bg-background-light max-w-4xl mx-auto">
      <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-slate-200">
        <div className="flex items-center p-4 gap-4">
          <button onClick={() => navigate('/')} className="size-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-xl font-bold tracking-tight">Menu Admin</h2>
        </div>
        <div className="flex border-t border-slate-100 items-center overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap ${activeTab === 'products' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap ${activeTab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
          >
            Categories
          </button>
          <button 
            onClick={() => setActiveTab('flavors')}
            className={`flex-1 py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap ${activeTab === 'flavors' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
          >
            Bakery Flavors
          </button>
          <button 
            onClick={() => setActiveTab('breadTypes')}
            className={`flex-1 py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap ${activeTab === 'breadTypes' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
          >
            Bread Types
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-6">
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div ref={formRef} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden scroll-mt-24">
              <button 
                onClick={() => setIsFormExpanded(!isFormExpanded)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-300 transition-colors"
                title={isFormExpanded ? "Collapse logic" : "Expand logic"}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    {editingId ? 'edit' : 'add_circle'}
                  </span>
                  <h3 className="font-bold text-lg">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                </div>
                <span className={`material-symbols-outlined text-slate-400 transition-transform ${isFormExpanded ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              <AnimatePresence>
                {isFormExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 space-y-4 border-t border-slate-100">
                      <AnimatePresence>
                        {formError && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2 border border-red-100"
                          >
                            <span className="material-symbols-outlined text-sm">error</span>
                            {formError}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <input 
                        placeholder="Name" 
                        value={draftProduct.name} 
                        onChange={e => setDraftProduct({...draftProduct, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm"
                      />
                      <div className="flex gap-2">
                        <input 
                          placeholder="Price" 
                          type="number"
                          value={draftProduct.price || ''} 
                          onChange={e => setDraftProduct({...draftProduct, price: parseFloat(e.target.value)})}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm"
                        />
                        <input 
                          placeholder="Unit (e.g. 1kg)" 
                          value={draftProduct.unit} 
                          onChange={e => setDraftProduct({...draftProduct, unit: e.target.value})}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm"
                        />
                      </div>
                      <select 
                        value={draftProduct.category} 
                        onChange={e => setDraftProduct({...draftProduct, category: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm"
                      >
                        {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                      <input 
                        placeholder="Image URL" 
                        value={draftProduct.image} 
                        onChange={e => setDraftProduct({...draftProduct, image: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm"
                      />
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input 
                          type="checkbox"
                          checked={draftProduct.isAvailable !== false}
                          onChange={e => setDraftProduct({...draftProduct, isAvailable: e.target.checked})}
                          className="w-5 h-5 accent-primary rounded cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-slate-700">Available to customers</span>
                      </label>
                      <div className="flex gap-2">
                        {editingId && (
                          <button 
                            onClick={() => { 
                              setEditingId(null); 
                              setFormError(null);
                              setIsFormExpanded(false);
                              setDraftProduct({ name: '', price: 0, unit: '', category: 'Groceries', image: '', isAvailable: true }); 
                            }}
                            className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          onClick={handleSaveProduct}
                          className="flex-1 py-2 bg-primary text-slate-900 rounded-lg font-bold text-sm"
                        >
                          {editingId ? 'Save Changes' : 'Add Product'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Product List</h3>
              </div>
              <div className="relative mb-4">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary text-sm shadow-sm"
                  placeholder="Search products..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {filteredProducts.map(p => (
                <div key={p.id} className={`flex gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100 items-center ${p.isAvailable === false ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <div className="relative">
                    <img src={p.image} alt={p.name} className="size-16 object-cover rounded-lg bg-slate-100" />
                    {p.isAvailable === false && (
                      <div className="absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                        Hidden
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm leading-tight">{p.name}</h4>
                    <p className="text-xs text-slate-500">{p.category} • ${p.price.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleEditProduct(p)} className="p-1.5 bg-slate-200 rounded-lg hover:bg-slate-300 text-slate-900">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onClick={() => dispatch(deleteProduct(p.id))} className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 text-white">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'flavors' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-lg">Add Bakery Flavor</h3>
              <div className="flex gap-2">
                <input 
                  placeholder="e.g. Matcha" 
                  value={newFlavor} 
                  onChange={e => setNewFlavor(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm"
                />
                <button 
                  onClick={handleAddFlavor}
                  className="px-4 py-2 bg-primary text-slate-900 rounded-lg font-bold text-sm"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-lg">Active Flavors</h3>
              <div className="grid grid-cols-2 gap-2">
                {bakeryFlavors.map(f => (
                  <div key={f} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <span className="font-medium text-sm">{f}</span>
                    <button onClick={() => dispatch(deleteFlavor(f))} className="text-red-400 hover:text-red-500 p-1">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'breadTypes' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-lg">Add Bread Type</h3>
              <div className="flex gap-2">
                <input 
                  placeholder="e.g. Multigrain" 
                  value={newBreadType} 
                  onChange={e => setNewBreadType(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm"
                />
                <button 
                  onClick={handleAddBreadType}
                  className="px-4 py-2 bg-primary text-slate-900 rounded-lg font-bold text-sm"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-lg">Active Bread Types</h3>
              <div className="grid grid-cols-2 gap-2">
                {breadTypes.map(b => (
                  <div key={b} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <span className="font-medium text-sm">{b}</span>
                    <button onClick={() => dispatch(deleteBreadType(b))} className="text-red-400 hover:text-red-500 p-1">
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-lg">Add Category</h3>
              <div className="flex gap-2">
                <input 
                  placeholder="e.g. Beverages" 
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm"
                />
                <select
                  value={newCategoryType}
                  onChange={e => setNewCategoryType(e.target.value as 'Normal' | 'Custom')}
                  className="bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm"
                >
                  <option value="Normal">Normal</option>
                  <option value="Custom">Custom</option>
                </select>
                <button 
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-primary text-slate-900 rounded-lg font-bold text-sm"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-slate-400">Custom categories allow customers to choose bread type and flavor.</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-lg">Active Categories</h3>
              <div className="grid grid-cols-1 gap-2">
                {categories.map(c => (
                  <div key={c.name} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    {editingCategory === c.name ? (
                      <>
                        <input
                          value={editingCategoryName}
                          onChange={e => setEditingCategoryName(e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-sm"
                        />
                        <button
                          onClick={() => {
                            if (editingCategoryName.trim() && editingCategoryName.trim() !== c.name) {
                              dispatch(renameCategory({ oldName: c.name, newName: editingCategoryName.trim() }));
                            }
                            setEditingCategory(null);
                          }}
                          className="p-1.5 bg-green-500 rounded-lg text-white hover:bg-green-600"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="p-1.5 bg-slate-200 rounded-lg text-slate-700 hover:bg-slate-300"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-sm">{c.name}</span>
                        <button
                          onClick={() => dispatch(updateCategoryType({ name: c.name, type: c.type === 'Normal' ? 'Custom' : 'Normal' }))}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                            c.type === 'Custom'
                              ? 'bg-yellow-accent text-slate-900'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {c.type}
                        </button>
                        <span className="text-xs text-slate-400">{products.filter(p => p.category === c.name).length} products</span>
                        <button
                          onClick={() => { setEditingCategory(c.name); setEditingCategoryName(c.name); }}
                          className="p-1.5 bg-slate-200 rounded-lg hover:bg-slate-300 text-slate-900"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => dispatch(deleteCategory(c.name))} className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 text-white">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
