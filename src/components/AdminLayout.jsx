import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ClipboardList, Utensils, Settings, LogOut } from 'lucide-react'

export default function AdminLayout() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto">
      {/* Top bar */}
      <header className="bg-brand-600 px-5 py-4 flex items-center justify-between sticky top-0 z-30">
        <div>
          <p className="text-brand-200 text-xs font-medium">Painel do Admin</p>
          <p className="text-white font-bold">🍕 PizzaExpress</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-brand-200 hover:text-white text-sm">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex z-30">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 text-xs font-semibold transition-colors ${
              isActive ? 'text-brand-500' : 'text-gray-400'
            }`
          }
        >
          <ClipboardList className="w-5 h-5 mb-0.5" />
          Pedidos
        </NavLink>
        <NavLink
          to="/admin/flavors"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 text-xs font-semibold transition-colors ${
              isActive ? 'text-brand-500' : 'text-gray-400'
            }`
          }
        >
          <Utensils className="w-5 h-5 mb-0.5" />
          Cardápio
        </NavLink>
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 text-xs font-semibold transition-colors ${
              isActive ? 'text-brand-500' : 'text-gray-400'
            }`
          }
        >
          <Settings className="w-5 h-5 mb-0.5" />
          Config.
        </NavLink>
      </nav>
    </div>
  )
}
