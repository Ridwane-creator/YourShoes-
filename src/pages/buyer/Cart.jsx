import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'

export default function Cart() {
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const total = useCartStore((s) => s.total())
  const navigate = useNavigate()

  if (!items.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-24 text-center">
        <ShoppingBag size={40} className="text-concrete-light mx-auto mb-4" strokeWidth={1.5} />
        <p className="font-display text-2xl mb-2">PANIER VIDE</p>
        <p className="font-body text-sm text-concrete mb-6">
          Aucune paire ajoutée pour le moment.
        </p>
        <Link
          to="/"
          className="inline-block bg-ink text-bone font-semibold text-sm px-6 py-3 rounded-full hover:bg-ink-soft transition-colors"
        >
          Voir le catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
      <p className="font-mono text-xs tracking-widest text-volt mb-2">PANIER</p>
      <h1 className="font-display text-3xl sm:text-4xl mb-8">
        {items.length} ARTICLE{items.length > 1 ? 'S' : ''}
      </h1>

      <div className="flex flex-col gap-4 mb-10">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex gap-4 bg-white border border-ink/10 rounded-2xl p-4"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl bg-bone-dim flex items-center justify-center overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
              ) : (
                <span className="font-display text-2xl text-concrete-light">
                  {item.brand?.[0] ?? '?'}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] tracking-widest text-concrete uppercase mb-0.5">
                {item.brand}
              </p>
              <h3 className="font-bold text-sm mb-1 truncate">{item.name}</h3>
              <p className="text-xs text-concrete mb-3">
                Taille {item.size}
                {item.color ? ` · ${item.color}` : ''}
              </p>

              <div className="flex items-center justify-between">
                <div className="inline-flex items-center border border-ink/15 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-bone-dim transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-bone-dim transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-display text-base">
                    {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
                  </span>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-concrete hover:text-red-600 transition-colors"
                    aria-label="Retirer du panier"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-ink/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <span className="font-mono text-xs tracking-widest text-concrete">TOTAL</span>
          <span className="font-display text-2xl">{total.toLocaleString('fr-FR')} FCFA</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-volt hover:bg-volt-dark text-white font-semibold text-sm py-4 rounded-full transition-colors"
        >
          Passer la commande
        </button>
      </div>
    </div>
  )
}
