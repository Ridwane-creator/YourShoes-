import { useEffect, useState } from 'react'
import { LogOut, Package } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'

const STATUS_LABELS = {
  pending: 'En attente',
  preparing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
}

function formatOrderNumber(id) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

export default function Account() {
  const { user, profile, signOut } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })
      setOrders(data ?? [])
      setLoading(false)
    }
    fetchOrders()
  }, [user])

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs tracking-widest text-volt mb-2">MON COMPTE</p>
          <h1 className="font-display text-3xl">
            SALUT {profile?.full_name?.split(' ')[0]?.toUpperCase() ?? ''} 👋
          </h1>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-xs font-semibold text-concrete hover:text-ink transition-colors"
        >
          <LogOut size={14} />
          Déconnexion
        </button>
      </div>

      <div className="bg-white border border-ink/10 rounded-2xl p-6 mb-8">
        <p className="font-mono text-[10px] tracking-widest text-concrete mb-3">INFOS</p>
        <p className="text-sm mb-1"><span className="text-concrete">Email :</span> {user?.email}</p>
        <p className="text-sm"><span className="text-concrete">Téléphone :</span> {profile?.phone || '—'}</p>
      </div>

      <p className="font-mono text-[10px] tracking-widest text-concrete mb-3">HISTORIQUE DES COMMANDES</p>

      {loading && <p className="font-mono text-sm text-concrete">Chargement…</p>}

      {!loading && !orders.length && (
        <div className="text-center py-14 border border-dashed border-ink/15 rounded-2xl">
          <Package size={28} className="text-concrete-light mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-concrete">Aucune commande pour l'instant.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-ink/10 rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-widest text-concrete mb-1">
                N° {formatOrderNumber(order.id)} · {new Date(order.created_at).toLocaleDateString('fr-FR')}
              </p>
              <p className="font-display text-lg">{order.total?.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <span className="text-[10px] font-mono tracking-widest px-3 py-1.5 rounded-full bg-tag/40 text-ink">
              {STATUS_LABELS[order.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
