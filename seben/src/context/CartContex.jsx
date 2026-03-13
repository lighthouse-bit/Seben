// src/context/CartContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext()
const CART_KEY = 'seben-cart'

const cartReducer = (state, action) => {
  let newState;
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(
        item => item.id === action.payload.id && item.size === action.payload.size
      )
      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id && item.size === action.payload.size
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        }
      } else {
        newState = { ...state, items: [...state.items, { ...action.payload, cartId: Date.now() }] }
      }
      break;
    }
    case 'REMOVE_FROM_CART':
      newState = { ...state, items: state.items.filter(item => item.cartId !== action.payload) }
      break;
    case 'UPDATE_QUANTITY':
      newState = {
        ...state,
        items: state.items.map(item =>
          item.cartId === action.payload.cartId ? { ...item, quantity: action.payload.quantity } : item
        ),
      }
      break;
    case 'CLEAR_CART':
      newState = { items: [] }
      break;
    case 'SYNC_STORAGE': // New case to sync from storage events
      newState = action.payload;
      break;
    default:
      return state
  }
  
  if (action.type !== 'SYNC_STORAGE') {
    localStorage.setItem(CART_KEY, JSON.stringify(newState))
  }
  return newState
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, () => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      return saved ? JSON.parse(saved) : { items: [] }
    } catch (e) {
      return { items: [] }
    }
  })

  // Listen for storage changes (clearing from other pages/components)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === CART_KEY) {
        try {
          const newData = e.newValue ? JSON.parse(e.newValue) : { items: [] };
          dispatch({ type: 'SYNC_STORAGE', payload: newData });
        } catch (err) {
          dispatch({ type: 'CLEAR_CART' });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addToCart = (product, quantity = 1, size = null) => {
    dispatch({ type: 'ADD_TO_CART', payload: { ...product, quantity, size } })
  }

  const removeFromCart = (cartId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: cartId })
  }

  const updateQuantity = (cartId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartId, quantity } })
  }

  const clearCart = () => {
    // 1. Remove from storage
    localStorage.removeItem(CART_KEY);
    
    // 2. Dispatch clear
    dispatch({ type: 'CLEAR_CART' });
    
    // 3. Dispatch storage event manually for current window
    window.dispatchEvent(new StorageEvent('storage', {
      key: CART_KEY,
      newValue: JSON.stringify({ items: [] })
    }));
  }

  const cartTotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  const cartCount = state.items.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items: state.items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}