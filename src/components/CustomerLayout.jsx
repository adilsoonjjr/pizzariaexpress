import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { Home, ShoppingCart, ClipboardList, LogOut } from 'lucide-react'

export default function CustomerLayout() {
  const { profile, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍕</span>
          <span className="font-black text-gray-800 text-lg">PizzaExpress</span>
        </div>
        <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-100 text-gray-400">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex z-30 safe-area-pb">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 text-xs font-semibold transition-colors ${
              isActive ? 'text-brand-500' : 'text-gray-400'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          Cardápio
        </NavLink>
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 text-xs font-semibold transition-colors relative ${
              isActive ? 'text-brand-500' : 'text-gray-400'
            }`
          }
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 mb-0.5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          Carrinho
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 text-xs font-semibold transition-colors ${
              isActive ? 'text-brand-500' : 'text-gray-400'
            }`
          }
        >
          <ClipboardList className="w-5 h-5 mb-0.5" />
          Pedidos
        </NavLink>
      </nav>
    </div>
  )
}
