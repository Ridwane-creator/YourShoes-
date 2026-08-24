import { useLocation, Link, Navigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'

function formatOrderNumber(id) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

const PAYMENT_LABELS = {
  mtn: 'MTN Mobile Money',
  moov: 'Moov Money',
  cash_on_delivery: 'Paiement à la livraison',
}

export default function OrderConfirmation() {
  const { state } = useLocation()

  if (!state?.order) {
    return <Navigate to="/" replace />
  }

  const { order, items } = state

  return (
    <div className="max-w-xl mx-auto px-4 md:px-8 py-16 text-center">
      <CheckCircle2 size={48} className="text-volt mx-auto mb-5" />
      <p className="font-mono text-xs tracking-widest text-volt mb-2">COMMANDE CONFIRMÉE</p>
      <h1 className="font-display text-3xl mb-2">MERCI {order.buyer_name?.toUpperCase()} !</h1>
      <p className="font-body text-sm text-concrete mb-8">
        Commande n° <span className="font-mono">{formatOrderNumber(order.id)}</span> — tu seras
        contacté au {order.buyer_phone} pour la livraison.
      </p>

      <div className="bg-white border border-ink/10 rounded-2xl p-6 text-left mb-8">
        <div className="flex flex-col gap-2 mb-4">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-sm">
              <span className="text-concrete">
                {item.name} ({item.size}) × {item.quantity}
              </span>
              <span className="font-semibold">
                {(item.price * item.quantity).toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          ))}
        </div>
        <div className="perforation mb-4" />
        <div className="flex justify-between text-sm mb-2">
          <span className="text-concrete">Livraison</span>
          <span>{order.delivery_address}, {order.delivery_city}</span>
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span className="text-concrete">Paiement</span>
          <span>{PAYMENT_LABELS[order.payment_method]}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-xs tracking-widest text-concrete">TOTAL</span>
          <span className="font-display text-xl">{order.total?.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      <Link
        to="/"
        className="inline-block bg-ink text-bone font-semibold text-sm px-6 py-3 rounded-full hover:bg-ink-soft transition-colors"
      >
        Continuer mes achats
      </Link>
    </div>
  )
}
