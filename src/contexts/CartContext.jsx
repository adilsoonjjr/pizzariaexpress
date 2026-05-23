import { createContext, useContext, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  function addItem(item) {
    setItems((prev) => [...prev, { ...item, cartId: Date.now() + Math.random() }])
  }

  function removeItem(cartId) {
    setItems((prev) => prev.filter((i) => i.cartId !== cartId))
  }

  function updateItem(cartId, updates) {
    setItems((prev) => prev.map((i) => (i.cartId === cartId ? { ...i, ...updates } : i)))
  }

  function clearCart() {
    setItems([])
  }

  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItem, clearCart, subtotal, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
