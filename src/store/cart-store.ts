import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: string
  name: string
  slug: string
  priceCents: number
  imageUrl?: string
  quantity: number
  maxQuantity: number
}

type CartState = {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

// El uso de create<CartState>() permite a TypeScript inferir los tipos de set y get automáticamente
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product) => {
        const { items } = get()
        const existingItem = items.find((i) => i.productId === product.productId)

        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + product.quantity, 
            product.maxQuantity
          )
          set({
            items: items.map((i) =>
              i.productId === product.productId
                ? { ...i, quantity: newQuantity }
                : i
            ),
            isOpen: true,
          })
        } else {
          set({ items: [...items, product], isOpen: true })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get()
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.maxQuantity) }
              : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((total, item) => total + item.priceCents * item.quantity, 0),
    }),
    {
      name: 'farmacia-cart-storage',
      // Solo guardamos los items en localStorage, no si el carrito está abierto
      partialize: (state) => ({ items: state.items }), 
    }
  )
)