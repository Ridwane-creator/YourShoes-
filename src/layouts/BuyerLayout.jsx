import { Outlet } from 'react-router-dom'
import Topbar from '../components/common/Topbar'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

export default function BuyerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bone">
      <Topbar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
