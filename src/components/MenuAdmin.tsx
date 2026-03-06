import React, { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, fetchMenuData, updateCategoryType, Product, AppDispatch } from '../store';
import { Category } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';

interface MenuAdminProps {}

export const MenuAdmin: React.FC<MenuAdminProps> = () => {
  const { products, bakeryFlavors, breadTypes, categories } = useSelector((state: RootState) => state.menu);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'products' | 'flavors' | 'breadTypes' | 'categories'>(
    () => (sessionStorage.getItem('menuAdminTab') as any) || 'products'
  );
  const handleSetActiveTab = (tab: 'products' | 'flavors' | 'breadTypes' | 'categories') => {
    sessionStorage.setItem('menuAdminTab', tab);
    setActiveTab(tab);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  
  // Product Form state
  const formRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [draftProduct, setDraftProduct] = useState<Partial<Product>>({
    name: '', price: 0, unit: '', category: categories[0]?.name || '', image: '', isAvailable: true
  });

  const [newFlavor, setNewFlavor] = useState('');
  const [newBreadType, setNewBreadType] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'Normal' | 'Custom'>('Normal');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingFlavor, setEditingFlavor] = useState<string | null>(null); // id
  const [editingFlavorName, setEditingFlavorName] = useState('');
  const [editingBreadType, setEditingBreadType] = useState<string | null>(null); // id
  const [editingBreadTypeName, setEditingBreadTypeName] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProduct = async () => {
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
    
    setIsSaving(true);
    const imageUrl = draftProduct.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800';
    const cat = categories.find(c => c.name === draftProduct.category);
    const category_id = cat?.id || '';

    if (!category_id) {
      setFormError('Selecciona una categoría válida antes de guardar.');
      setIsSaving(false);
      return;
    }

    try {
      if (editingId) {
        await api.updateProduct(editingId, { 
          name: draftProduct.name, 
          price: draftProduct.price, 
          unit: draftProduct.unit, 
          category_id, 
          image: imageUrl, 
          is_available: draftProduct.isAvailable ?? true 
        });
      } else {
        const newId = Math.random().toString(36).substr(2, 9);
        await api.createProduct({ 
          id: newId, 
          name: draftProduct.name, 
          price: draftProduct.price, 
          unit: draftProduct.unit, 
          category_id, 
          image: imageUrl, 
          is_available: draftProduct.isAvailable ?? true 
        });
      }
      dispatch(fetchMenuData());
      setEditingId(null);
      setDraftProduct({ name: '', price: 0, unit: '', category: categories[0]?.name || '', image: '', isAvailable: true });
      setIsFormExpanded(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
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

  const handleDeleteProduct = async (id: string) => {
    try {
      setIsSaving(true);
      await api.deleteProduct(id);
      dispatch(fetchMenuData());
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFlavor = async () => {
    if (newFlavor.trim() && !bakeryFlavors.find(f => f.name === newFlavor.trim())) {
      setIsSaving(true);
      try {
        await api.createBakeryFlavor({ name: newFlavor.trim() });
        dispatch(fetchMenuData());
        setNewFlavor('');
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleUpdateFlavor = async (id: string, newName: string) => {
    setIsSaving(true);
    try {
      await api.updateBakeryFlavor(id, { name: newName.trim() });
      dispatch(fetchMenuData());
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
    setEditingFlavor(null);
  };

  const handleDeleteFlavor = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deleteBakeryFlavor(id);
      dispatch(fetchMenuData());
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBreadType = async () => {
    if (newBreadType.trim() && !breadTypes.find(b => b.name === newBreadType.trim())) {
      setIsSaving(true);
      try {
        await api.createBreadType({ name: newBreadType.trim() });
        dispatch(fetchMenuData());
        setNewBreadType('');
      } catch (err) {} finally {
        setIsSaving(false);
      }
    }
  };

  const handleUpdateBreadType = async (id: string, newName: string) => {
    setIsSaving(true);
    try {
      await api.updateBreadType(id, { name: newName.trim() });
      dispatch(fetchMenuData());
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
    setEditingBreadType(null);
  };

  const handleDeleteBreadType = async (id: string) => {
    setIsSaving(true);
    try {
      await api.deleteBreadType(id);
      dispatch(fetchMenuData());
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim() && !categories.find(c => c.name === newCategory.trim())) {
      try {
        setIsSaving(true);
        await api.createCategory({ name: newCategory.trim(), type: newCategoryType });
        dispatch(fetchMenuData());
        setNewCategory('');
        setNewCategoryType('Normal');
      } catch (err) {} finally {
        setIsSaving(false);
      }
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
            onClick={() => handleSetActiveTab('products')}
            className={`flex-1 py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap ${activeTab === 'products' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
          >
            Products
          </button>
          <button 
            onClick={() => handleSetActiveTab('categories')}
            className={`flex-1 py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap ${activeTab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
          >
            Categories
          </button>
          <button 
            onClick={() => handleSetActiveTab('flavors')}
            className={`flex-1 py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap ${activeTab === 'flavors' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
          >
            Sabor de escarchado
          </button>
          <button 
            onClick={() => handleSetActiveTab('breadTypes')}
            className={`flex-1 py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap ${activeTab === 'breadTypes' ? 'border-primary text-primary' : 'border-transparent text-slate-500'}`}
          >
            Cervezas
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
                        <span className="text-sm font-semibold text-slate-700">Disponible para clientes</span>
                      </label>
                      <div className="flex gap-2">
                        {editingId && (
                          <button 
                            onClick={() => { 
                              setEditingId(null); 
                              setFormError(null);
                              setIsFormExpanded(false);
                              setDraftProduct({ name: '', price: 0, unit: '', category: categories[0]?.name || '', image: '', isAvailable: true }); 
                            }}
                            className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm"
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          onClick={handleSaveProduct}
                          disabled={isSaving}
                          className="flex-1 py-2 bg-primary text-slate-900 rounded-lg font-bold text-sm flex justify-center items-center disabled:opacity-50"
                        >
                          {isSaving ? (
                            <span className="block w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            editingId ? 'Save Changes' : 'Add Product'
                          )}
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
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 text-white">
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
              <h3 className="font-bold text-lg">Agregar Sabor de Escarchado</h3>
              <div className="flex gap-2">
                <input 
                  placeholder="ej. Matcha" 
                  value={newFlavor} 
                  onChange={e => setNewFlavor(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddFlavor()}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm"
                />
                <button 
                  onClick={handleAddFlavor}
                  disabled={isSaving || !newFlavor.trim()}
                  className="px-4 py-2 bg-primary text-slate-900 rounded-lg font-bold text-sm disabled:opacity-50"
                >
                  {isSaving ? <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin inline-block" /> : 'Agregar'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-lg">Sabores activos</h3>
              <div className="grid grid-cols-1 gap-2">
                {bakeryFlavors.map(f => (
                  <div key={f.id} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    {editingFlavor === f.id ? (
                      <>
                        <input
                          value={editingFlavorName}
                          onChange={e => setEditingFlavorName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleUpdateFlavor(f.id, editingFlavorName)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateFlavor(f.id, editingFlavorName)}
                          disabled={isSaving}
                          className="p-1.5 bg-green-500 rounded-lg text-white hover:bg-green-600 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                        </button>
                        <button
                          onClick={() => setEditingFlavor(null)}
                          className="p-1.5 bg-slate-200 rounded-lg text-slate-700 hover:bg-slate-300"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-sm">{f.name}</span>
                        <button
                          onClick={() => { setEditingFlavor(f.id); setEditingFlavorName(f.name); }}
                          className="p-1.5 bg-slate-200 rounded-lg hover:bg-slate-300 text-slate-900"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteFlavor(f.id)}
                          disabled={isSaving}
                          className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 text-white disabled:opacity-50"
                        >
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
        {activeTab === 'breadTypes' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-lg">Agregar Cerveza</h3>
              <div className="flex gap-2">
                <input 
                  placeholder="ej. IPA, Lager" 
                  value={newBreadType} 
                  onChange={e => setNewBreadType(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddBreadType()}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm"
                />
                <button 
                  onClick={handleAddBreadType}
                  disabled={isSaving || !newBreadType.trim()}
                  className="px-4 py-2 bg-primary text-slate-900 rounded-lg font-bold text-sm disabled:opacity-50"
                >
                  {isSaving ? <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin inline-block" /> : 'Agregar'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-lg">Cervezas activas</h3>
              <div className="grid grid-cols-1 gap-2">
                {breadTypes.map(b => (
                  <div key={b.id} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    {editingBreadType === b.id ? (
                      <>
                        <input
                          value={editingBreadTypeName}
                          onChange={e => setEditingBreadTypeName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleUpdateBreadType(b.id, editingBreadTypeName)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateBreadType(b.id, editingBreadTypeName)}
                          disabled={isSaving}
                          className="p-1.5 bg-green-500 rounded-lg text-white hover:bg-green-600 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                        </button>
                        <button
                          onClick={() => setEditingBreadType(null)}
                          className="p-1.5 bg-slate-200 rounded-lg text-slate-700 hover:bg-slate-300"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-sm">{b.name}</span>
                        <button
                          onClick={() => { setEditingBreadType(b.id); setEditingBreadTypeName(b.name); }}
                          className="p-1.5 bg-slate-200 rounded-lg hover:bg-slate-300 text-slate-900"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBreadType(b.id)}
                          disabled={isSaving}
                          className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 text-white disabled:opacity-50"
                        >
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
                  Añadir
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
                          onClick={async () => {
                            if (editingCategoryName.trim() && editingCategoryName.trim() !== c.name) {
                              try {
                                await api.updateCategory(c.id!, { name: editingCategoryName.trim() });
                                dispatch(fetchMenuData());
                              } catch(err) {}
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
                        <button onClick={async () => {
                          try {
                            if (c.id) { await api.deleteCategory(c.id); dispatch(fetchMenuData()); }
                          }catch(err){}
                        }} className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 text-white">
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
