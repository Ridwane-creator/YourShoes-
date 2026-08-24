import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, ClipboardList, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/produits', label: 'Produits', icon: Package },
  { to: '/admin/commandes', label: 'Commandes', icon: ClipboardList },
]

export default function AdminLayout() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen flex bg-bone">
      <aside className="w-60 shrink-0 bg-ink text-bone flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <span className="font-display text-xl leading-none tracking-tight">
            SNEAK<span className="text-volt">STORE</span>
          </span>
        </div>
        <p className="font-mono text-[10px] tracking-widest text-tag px-6 pt-5 pb-2">
          ESPACE VENDEUR
        </p>
        <nav className="flex-1 px-3 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-volt text-white'
                    : 'text-concrete-light hover:bg-white/5 hover:text-bone'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={signOut}
          className="mx-3 mb-5 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-concrete-light hover:bg-white/5 hover:text-bone transition-colors"
        >
          <LogOut size={17} />
          Déconnexion
        </button>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
