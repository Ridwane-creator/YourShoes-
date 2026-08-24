import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCartStore } from '../../store/cartStore'

function formatSku(id) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem)
  const variants = product.product_variants ?? []
  const inStock = variants.some((v) => v.stock > 0)
  const image = product.images?.[0]

  function handleAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    const firstAvailable = variants.find((v) => v.stock > 0)
    if (!firstAvailable) return
    addItem({
      variantId: firstAvailable.id,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      image,
      size: firstAvailable.size,
      color: firstAvailable.color,
      price: product.price,
      quantity: 1,
    })
    toast.success('Ajouté au panier')
  }

  return (
    <Link
      to={`/produit/${product.id}`}
      className="group bg-white rounded-2xl border border-ink/10 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_12px_0_0_rgba(20,21,26,1)] hover:border-ink"
    >
      {/* Zone image + SKU */}
      <div className="relative aspect-square bg-bone-dim flex items-center justify-center overflow-hidden">
        <span className="absolute top-3 left-3 font-mono text-[10px] tracking-widest text-concrete">
          SKU {formatSku(product.id)}
        </span>
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Ajouter aux favoris"
        >
          <Heart size={15} />
        </button>

        {image ? (
          <img src={image} alt={product.name} className="w-full h-full object-contain p-6" />
        ) : (
          <span className="font-display text-6xl text-concrete-light">
            {product.brand?.[0] ?? '?'}
          </span>
        )}

        {!inStock && (
          <span className="absolute bottom-3 left-3 bg-ink text-bone text-[10px] font-mono tracking-widest px-2.5 py-1 rounded-full">
            RUPTURE
          </span>
        )}
      </div>

      <div className="perforation" />

      {/* Étiquette info produit */}
      <div className="p-4">
        <p className="font-mono text-[10px] tracking-widest text-concrete uppercase mb-1">
          {product.brand}
        </p>
        <h3 className="font-body font-bold text-sm leading-snug mb-3 line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="font-display text-lg">
            {product.price?.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
          </span>
          <button
            onClick={handleAdd}
            disabled={!inStock}
            className="bg-volt text-white text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-volt-dark transition-colors disabled:bg-concrete-light disabled:cursor-not-allowed"
          >
            Ajouter
          </button>
        </div>
      </div>
    </Link>
  )
}
