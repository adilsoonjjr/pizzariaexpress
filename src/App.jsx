import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import CustomerLayout from './components/CustomerLayout'
import AdminLayout from './components/AdminLayout'
import Home from './pages/customer/Home'
import Cart from './pages/customer/Cart'
import Checkout from './pages/customer/Checkout'
import MyOrders from './pages/customer/MyOrders'
import AdminOrders from './pages/admin/AdminOrders'
import AdminFlavors from './pages/admin/AdminFlavors'
import AdminSettings from './pages/admin/AdminSettings'

function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (role && profile?.role !== role)
    return <Navigate to={profile?.role === 'admin' ? '/admin' : '/'} replace />
  return children
}

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🍕</div>
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )
}

function AppRoutes() {
  const { user, profile, loading } = useAuth()
  if (loading) return <Spinner />

  return (
    <Routes>
      <Route path="/login"           element={!user ? <Login />           : <Navigate to={profile?.role === 'admin' ? '/admin' : '/'} replace />} />
      <Route path="/register"        element={!user ? <Register />        : <Navigate to={profile?.role === 'admin' ? '/admin' : '/'} replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      <Route path="/" element={<ProtectedRoute role="customer"><CartProvider><CustomerLayout /></CartProvider></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="cart"     element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders"   element={<MyOrders />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminOrders />} />
        <Route path="flavors"  element={<AdminFlavors />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { borderRadius: '16px', fontWeight: '600', fontSize: '14px' },
            success: { iconTheme: { primary: '#e63020', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
