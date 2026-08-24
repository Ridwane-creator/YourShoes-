import { PackageSearch } from 'lucide-react'
import ProductCard from './ProductCard'

export default function ProductGrid({ products, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 py-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-bone-dim animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="font-mono text-sm text-concrete">
          Impossible de charger le catalogue pour le moment.
        </p>
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="py-20 flex flex-col items-center text-center">
        <PackageSearch size={40} className="text-concrete-light mb-4" strokeWidth={1.5} />
        <p className="font-display text-xl mb-1">CATALOGUE VIDE</p>
        <p className="font-body text-sm text-concrete max-w-sm">
          Aucun produit publié pour le moment. Dès qu'une paire est déposée
          depuis l'espace vendeur, elle apparaît ici automatiquement.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 py-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
