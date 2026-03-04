import { configureStore, createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as api from './api';

export interface Category {
  id?: string;
  name: string;
  type: 'Normal' | 'Custom';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  unit: string;
  category: string;
  isAvailable?: boolean;
}

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  flavors?: string[];
  breadType?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
}

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchMenuData = createAsyncThunk('menu/fetchMenuData', async () => {
  const [productsRes, categoriesRes, flavorsRes, breadsRes] = await Promise.all([
    api.getProducts(),
    api.getCategories(),
    api.getBakeryFlavors(),
    api.getBreadTypes(),
  ]);
  
  return {
    products: productsRes.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
      image: p.image,
      unit: p.unit,
      category: p.category ? p.category.name : p.category_id,
      isAvailable: p.isAvailable !== false,
    })),
    categories: categoriesRes.data.map((c: any) => ({
      id: c.id,
      name: c.name,
      type: c.type,
    })),
    bakeryFlavors: flavorsRes.data.map((f: any) => f.name),
    breadTypes: breadsRes.data.map((b: any) => b.name),
  };
});

// Since the string DB has no login endpoint out of the box, we fallback to fetch users
export const loginUser = createAsyncThunk('auth/loginUser', async (credentials: { username: string; password?: string }) => {
  const res = await api.getUsers();
  const users = res.data;
  const user = users.find((u: any) => u.username === credentials.username);
  if (user) {
    return { username: user.username, role: user.role, phone: user.phone || '' };
  }
  throw new Error('Invalid credentials');
});

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async () => {
  const res = await api.getOrders();
  return res.data;
});

export const createOrderEntry = createAsyncThunk('orders/createOrderEntry', async (orderData: Partial<Order>) => {
  const res = await api.createOrder({
    total: orderData.total,
    customer_name: orderData.customerName,
    customer_phone: orderData.customerPhone,
    delivery_address: orderData.deliveryAddress,
    status: orderData.status,
  });
  return {
    id: res.data.id,
    items: orderData.items || [],
    total: res.data.total,
    date: res.data.created_at || new Date().toISOString(),
    customerName: res.data.customer_name,
    customerPhone: res.data.customer_phone,
    deliveryAddress: res.data.delivery_address,
    status: res.data.status,
  } as Order;
});

// ── Cart slice ───────────────────────────────────────────────────────────────
interface CartState {
  items: CartItem[];
}

const initialCartState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product & { flavors?: string[]; breadType?: string }>) => {
      const flavorStr = action.payload.flavors && action.payload.flavors.length > 0
        ? `-${action.payload.flavors.slice().sort().join('-')}`
        : '';
      const breadStr = action.payload.breadType ? `-${action.payload.breadType.replace(/\s+/g, '')}` : '';
      const cartItemId = `${action.payload.id}${flavorStr}${breadStr}`;

      const existingItem = state.items.find(item => item.cartItemId === cartItemId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, cartItemId, quantity: 1 });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.cartItemId !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ cartItemId: string; quantity: number }>) => {
      const item = state.items.find(item => item.cartItemId === action.payload.cartItemId);
      if (item) {
        item.quantity = Math.max(0, action.payload.quantity);
        if (item.quantity === 0) {
          state.items = state.items.filter(i => i.cartItemId !== action.payload.cartItemId);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

// ── Orders slice ──────────────────────────────────────────────────────────────
interface OrdersState {
  history: Order[];
  loading: boolean;
}

const ordersInitialState: OrdersState = {
  history: [],
  loading: false,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState: ordersInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.map((o: any) => ({
          id: o.id,
          date: o.created_at,
          total: Number(o.total),
          customerName: o.customer_name,
          customerPhone: o.customer_phone,
          deliveryAddress: o.delivery_address,
          status: o.status,
          items: [], 
        }));
      })
      .addCase(createOrderEntry.fulfilled, (state, action) => {
        state.history.unshift(action.payload);
      });
  }
});

// ── Profile slice ─────────────────────────────────────────────────────────────
export interface ProfileState {
  name: string;
  phone: string;
  address: string;
}

const profileInitialState: ProfileState = {
  name: '',
  phone: '',
  address: '',
};

const profileSlice = createSlice({
  name: 'profile',
  initialState: profileInitialState,
  reducers: {
    setProfile: (state, action: PayloadAction<ProfileState>) => {
      state.name = action.payload.name;
      state.phone = action.payload.phone;
      state.address = action.payload.address;
    },
  },
});

export const { setProfile } = profileSlice.actions;

// ── Menu slice ───────────────────────────────────────────────────────────────
interface MenuState {
  products: Product[];
  bakeryFlavors: string[];
  breadTypes: string[];
  categories: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const menuInitialState: MenuState = {
  products: [],
  bakeryFlavors: [],
  breadTypes: [],
  categories: [],
  status: 'idle',
};

const menuSlice = createSlice({
  name: 'menu',
  initialState: menuInitialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    addFlavor: (state, action: PayloadAction<string>) => {
      if (!state.bakeryFlavors.includes(action.payload)) {
        state.bakeryFlavors.push(action.payload);
      }
    },
    deleteFlavor: (state, action: PayloadAction<string>) => {
      state.bakeryFlavors = state.bakeryFlavors.filter(f => f !== action.payload);
    },
    addBreadType: (state, action: PayloadAction<string>) => {
      if (!state.breadTypes.includes(action.payload)) {
        state.breadTypes.push(action.payload);
      }
    },
    deleteBreadType: (state, action: PayloadAction<string>) => {
      state.breadTypes = state.breadTypes.filter(b => b !== action.payload);
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      if (!state.categories.find(c => c.name === action.payload.name)) {
        state.categories.push(action.payload);
      }
    },
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(c => c.name !== action.payload);
    },
    renameCategory: (state, action: PayloadAction<{ oldName: string; newName: string }>) => {
      const { oldName, newName } = action.payload;
      const cat = state.categories.find(c => c.name === oldName);
      if (cat && !state.categories.find(c => c.name === newName)) {
        cat.name = newName;
        state.products.forEach(p => {
          if (p.category === oldName) p.category = newName;
        });
      }
    },
    updateCategoryType: (state, action: PayloadAction<{ name: string; type: 'Normal' | 'Custom' }>) => {
      const cat = state.categories.find(c => c.name === action.payload.name);
      if (cat) cat.type = action.payload.type;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMenuData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload.products;
        state.categories = action.payload.categories;
        state.bakeryFlavors = action.payload.bakeryFlavors;
        state.breadTypes = action.payload.breadTypes;
      })
      .addCase(fetchMenuData.rejected, (state) => {
        state.status = 'failed';
      });
  }
});

export const { addProduct, updateProduct, deleteProduct, addFlavor, deleteFlavor, addBreadType, deleteBreadType, addCategory, deleteCategory, renameCategory, updateCategoryType } = menuSlice.actions;

// ── Auth slice ───────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'user';

interface AuthUser {
  username: string;
  role: UserRole;
  phone: string;
}

interface AuthState {
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  error: string | null;
}

const authInitialState: AuthState = {
  isAuthenticated: false,
  currentUser: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.currentUser = action.payload as any;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.currentUser = null;
        state.error = action.error.message || 'Login failed';
      });
  }
});

export const { logout } = authSlice.actions;

export const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
    profile: profileSlice.reducer,
    orders: ordersSlice.reducer,
    menu: menuSlice.reducer,
    auth: authSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
