import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PRODUCTS, BAKERY_FLAVORS, BREAD_TYPES, INITIAL_CATEGORIES, Category } from './constants';

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

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
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
}

const ordersInitialState: OrdersState = {
  history: [],
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState: ordersInitialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      // Add the new order at the beginning of the history
      state.history.unshift(action.payload);
    },
  },
});

export const { addOrder } = ordersSlice.actions;

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
}

const menuInitialState: MenuState = {
  products: PRODUCTS,
  bakeryFlavors: BAKERY_FLAVORS,
  breadTypes: BREAD_TYPES,
  categories: INITIAL_CATEGORIES,
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
}

const MOCK_USERS: (AuthUser & { password: string })[] = [
  { username: 'admin', password: 'admin', role: 'admin', phone: '' },
  { username: 'user1', password: 'user1', role: 'user', phone: '1234567890' },
  { username: 'user2', password: 'user2', role: 'user', phone: '0987654321' },
];

const authInitialState: AuthState = {
  isAuthenticated: false,
  currentUser: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: {
    login: (state, action: PayloadAction<{ username: string; password: string }>) => {
      const found = MOCK_USERS.find(
        u => u.username === action.payload.username && u.password === action.payload.password
      );
      if (found) {
        state.isAuthenticated = true;
        state.currentUser = { username: found.username, role: found.role, phone: found.phone };
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

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
