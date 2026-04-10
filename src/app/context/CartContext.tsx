import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  title: string;
  type: 'sale' | 'rent';
  price: number;
  location: string;
  image: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  showToast: boolean;
  toastMessage: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'bsng_cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const itemCount = items.length;
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      if (prev.find(i => i.id === item.id)) {
        setToastMessage(`"${item.title}" is already in your cart`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return prev;
      }
      setToastMessage(`"${item.title}" added to cart!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => setItems([]);

  const isInCart = (id: string) => items.some(i => i.id === id);

  return (
    <CartContext.Provider value={{ items, itemCount, totalPrice, addToCart, removeFromCart, clearCart, isInCart, showToast, toastMessage }}>
      {children}
      {/* Global Toast Notification */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            animation: 'slideUp 0.4s ease-out',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #009CFF 0%, #0066CC 100%)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 8px 32px rgba(0,156,255,0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              maxWidth: '400px',
            }}
          >
            <span style={{ fontSize: '18px' }}>🛒</span>
            {toastMessage}
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
