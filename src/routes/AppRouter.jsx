import { Routes, Route } from 'react-router-dom'
import BuyerLayout from '../layouts/BuyerLayout'
import AdminLayout from '../layouts/AdminLayout'
import Home from '../pages/buyer/Home'
import ProductDetail from '../pages/buyer/ProductDetail'
import Cart from '../pages/buyer/Cart'
import Checkout from '../pages/buyer/Checkout'
import OrderConfirmation from '../pages/buyer/OrderConfirmation'
import Account from '../pages/buyer/Account'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import AdminLogin from '../pages/admin/AdminLogin'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminProducts from '../pages/admin/AdminProducts'
import AdminOrders from '../pages/admin/AdminOrders'
import ProtectedRoute from './ProtectedRoute'
import BuyerRoute from './BuyerRoute'

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<BuyerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/produit/:id" element={<ProductDetail />} />
        <Route path="/panier" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/commande-confirmee" element={<OrderConfirmation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
        <Route
          path="/compte"
          element={
            <BuyerRoute>
              <Account />
            </BuyerRoute>
          }
        />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="produits" element={<AdminProducts />} />
        <Route path="commandes" element={<AdminOrders />} />
      </Route>
    </Routes>
  )
}
