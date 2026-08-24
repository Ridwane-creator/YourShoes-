import { useState } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useAuth } from '../../hooks/useAuth'

const CATEGORIES = [
  { label: 'Homme', to: '/?category=homme' },
  { label: 'Femme', to: '/?category=femme' },
  { label: 'Enfant', to: '/?category=enfant' },
  { label: 'Nouveautés', to: '/' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const count = useCartStore((s) => s.count())
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '')
  const activeCategory = searchParams.get('category') ?? ''

  function isCategoryActive(item) {
    if (item.label === 'Nouveautés') {
      return location.pathname === '/' && !activeCategory && !searchParams.get('q')
    }
    const value = new URLSearchParams(item.to.split('?')[1]).get('category')
    return location.pathname === '/' && activeCategory === value
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    const trimmed = searchValue.trim()
    navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : '/')
  }

  function handleSearchChange(e) {
    const value = e.target.value
    setSearchValue(value)
    // Filtrage en direct si on est déjà sur la page d'accueil
    if (location.pathname === '/') {
      navigate(value.trim() ? `/?q=${encodeURIComponent(value.trim())}` : '/', { replace: true })
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-bone/95 backdrop-blur border-b border-ink">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-0.5 shrink-0">
          <span className="font-display text-3xl leading-none tracking-tight">SNEAK</span>
          <span className="font-display text-3xl leading-none tracking-tight text-volt">STORE</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden lg:flex items-center gap-8 font-body font-semibold text-sm">
          {CATEGORIES.map((cat) => {
            const active = isCategoryActive(cat)
            return (
              <Link
                key={cat.label}
                to={cat.to}
                onClick={() => setSearchValue('')}
                className="relative group"
              >
                {cat.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-0.5 bg-volt transition-all ${
                    active ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            )
          })}
        </nav>

        {/* Recherche */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center flex-1 max-w-sm bg-white border border-ink/15 rounded-full px-4 h-11"
        >
          <Search size={17} className="text-concrete shrink-0" />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Chercher une basket, une marque…"
            className="w-full bg-transparent outline-none px-3 text-sm font-body placeholder:text-concrete"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue('')
                navigate('/')
              }}
              className="text-concrete hover:text-ink transition-colors"
              aria-label="Effacer la recherche"
            >
              <X size={15} />
            </button>
          )}
        </form>

        {/* Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            to={user ? '/compte' : '/login'}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold hover:text-volt transition-colors"
          >
            <User size={19} />
            <span className="hidden xl:inline">
              {user ? profile?.full_name?.split(' ')[0] ?? 'Compte' : 'Connexion'}
            </span>
          </Link>
          <Link to="/panier" className="relative flex items-center gap-1.5 text-sm font-semibold hover:text-volt transition-colors">
            <ShoppingBag size={19} />
            <span className="hidden xl:inline">Panier</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2.5 xl:static xl:ml-0.5 bg-volt text-white text-[11px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Ouvrir le menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="lg:hidden border-t border-ink/10 bg-bone px-4 py-4 flex flex-col gap-3 font-semibold text-sm">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              to={cat.to}
              onClick={() => {
                setSearchValue('')
                setMenuOpen(false)
              }}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
