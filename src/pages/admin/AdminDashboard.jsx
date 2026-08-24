import { Package, PackageX, Layers } from 'lucide-react'
import { useProducts } from '../../hooks/useProducts'

export default function AdminDashboard() {
  const { products, loading } = useProducts({ includeInactive: true })

  const published = products.filter((p) => p.is_active).length
  const hidden = products.filter((p) => !p.is_active).length
  const totalStock = products.reduce(
    (sum, p) => sum + (p.product_variants ?? []).reduce((s, v) => s + v.stock, 0),
    0
  )

  const stats = [
    { label: 'Produits publiés', value: published, icon: Package },
    { label: 'Produits masqués', value: hidden, icon: PackageX },
    { label: 'Stock total (paires)', value: totalStock, icon: Layers },
  ]

  return (
    <div className="p-8 max-w-5xl">
      <p className="font-mono text-[10px] tracking-widest text-volt mb-1">VUE D'ENSEMBLE</p>
      <h1 className="font-display text-3xl mb-8">DASHBOARD</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-ink/10 rounded-2xl p-6">
            <Icon size={20} className="text-volt mb-4" />
            <p className="font-display text-3xl mb-1">{loading ? '—' : value}</p>
            <p className="font-mono text-[10px] tracking-widest text-concrete">{label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      <p className="font-mono text-xs text-concrete mt-10">
        La gestion des commandes arrive ensuite dans l'onglet "Commandes".
      </p>
    </div>
  )
}
