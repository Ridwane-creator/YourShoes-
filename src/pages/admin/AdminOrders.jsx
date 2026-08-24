import { useEffect, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

const STATUSES = [
  { value: 'pending', label: 'En attente' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
]

const PAYMENT_LABELS = {
  mtn: 'MTN MoMo',
  moov: 'Moov Money',
  cash_on_delivery: 'À la livraison',
}

function formatOrderNumber(id) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [items, setItems] = useState({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      toast.error('Impossible de charger les commandes')
    } else {
      setOrders(data ?? [])
    }
    setLoading(false)
  }

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter(
      (o) =>
        o.buyer_name?.toLowerCase().includes(q) ||
        o.buyer_phone?.toLowerCase().includes(q) ||
        formatOrderNumber(o.id).toLowerCase().includes(q)
    )
  }, [orders, search])

  async function toggleExpand(orderId) {
    if (expanded === orderId) {
      setExpanded(null)
      return
    }
    setExpanded(orderId)
    if (!items[orderId]) {
      const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId)
      setItems((prev) => ({ ...prev, [orderId]: data ?? [] }))
    }
  }

  async function updateStatus(orderId, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) {
      toast.error('Impossible de mettre à jour le statut')
      return
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    toast.success('Statut mis à jour')
  }

  return (
    <div className="p-8 max-w-5xl">
      <p className="font-mono text-[10px] tracking-widest text-volt mb-1">GESTION</p>
      <h1 className="font-display text-3xl mb-6">COMMANDES</h1>

      <div className="flex items-center gap-2.5 bg-white border border-ink/15 rounded-full px-4 h-11 mb-6 max-w-sm">
        <Search size={16} className="text-concrete shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom, téléphone, n° de commande…"
          className="w-full bg-transparent outline-none text-sm font-body placeholder:text-concrete"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-concrete hover:text-ink transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {loading && <p className="font-mono text-sm text-concrete">Chargement…</p>}

      {!loading && !orders.length && (
        <p className="font-mono text-sm text-concrete py-10 text-center">
          Aucune commande pour le moment.
        </p>
      )}

      {!loading && orders.length > 0 && !filteredOrders.length && (
        <p className="font-mono text-sm text-concrete py-10 text-center">
          Aucune commande ne correspond à "{search}".
        </p>
      )}

      {!loading && filteredOrders.length > 0 && (
        <div className="flex flex-col gap-3">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border border-ink/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleExpand(order.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <p className="font-mono text-[10px] tracking-widest text-concrete mb-1">
                    N° {formatOrderNumber(order.id)} · {PAYMENT_LABELS[order.payment_method]}
                  </p>
                  <p className="font-semibold text-sm">
                    {order.buyer_name} — {order.buyer_phone}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-lg">
                    {order.total?.toLocaleString('fr-FR')} FCFA
                  </span>
                  <select
                    value={order.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="text-xs font-mono tracking-widest border border-ink/15 rounded-full px-3 py-1.5 bg-bone-dim outline-none cursor-pointer"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </button>

              {expanded === order.id && (
                <div className="border-t border-ink/10 px-5 py-4 bg-bone-dim/40">
                  <p className="text-xs text-concrete mb-3">
                    {order.delivery_address}, {order.delivery_city}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {(items[order.id] ?? []).map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.product_name} ({item.size}{item.color ? ` · ${item.color}` : ''}) × {item.quantity}
                        </span>
                        <span className="font-semibold">
                          {(item.unit_price * item.quantity).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
