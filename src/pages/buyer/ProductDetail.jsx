import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Minus, Plus, ShieldCheck, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useProduct } from '../../hooks/useProduct'
import { useCartStore } from '../../store/cartStore'

function formatSku(id) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

export default function ProductDetail() {
  const { id } = useParams()
  const { product, loading, error } = useProduct(id)
  const addItem = useCartStore((s) => s.addItem)

  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [quantity, setQuantity] = useState(1)

  const variants = product?.product_variants ?? []
  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size))], [variants])
  const colors = useMemo(() => [...new Set(variants.map((v) => v.color).filter(Boolean))], [variants])

  const matchingVariant = variants.find(
    (v) =>
      v.size === (selectedSize ?? sizes[0]) &&
      (colors.length === 0 || v.color === (selectedColor ?? colors[0]))
  )

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square rounded-2xl bg-bone-dim" />
          <div className="space-y-4">
            <div className="h-4 w-24 bg-bone-dim rounded" />
            <div className="h-10 w-3/4 bg-bone-dim rounded" />
            <div className="h-6 w-32 bg-bone-dim rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-20 text-center">
        <p className="font-display text-2xl mb-3">PRODUIT INTROUVABLE</p>
        <p className="font-body text-sm text-concrete mb-6">
          Ce modèle n'existe plus ou a été retiré du catalogue.
        </p>
        <Link to="/" className="text-volt font-semibold text-sm underline underline-offset-4">
          Retour au catalogue
        </Link>
      </div>
    )
  }

  const images = product.images?.length ? product.images : [null]
  const stockForSelection = matchingVariant?.stock ?? 0
  const canAdd = stockForSelection > 0 && quantity <= stockForSelection

  function handleAddToCart() {
    if (!matchingVariant) {
      toast.error('Sélectionne une taille disponible.')
      return
    }
    addItem({
      variantId: matchingVariant.id,
      productId: product.id,
      name: product.name,
      brand: product.brand,
      image: product.images?.[0],
      size: matchingVariant.size,
      color: matchingVariant.color,
      price: product.price,
      quantity,
    })
    toast.success('Ajouté au panier')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-concrete hover:text-ink transition-colors mb-8"
      >
        <ChevronLeft size={15} />
        Retour au catalogue
      </Link>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Galerie */}
        <div>
          <div className="relative aspect-square rounded-2xl bg-bone-dim flex items-center justify-center overflow-hidden mb-3">
            <span className="absolute top-4 left-4 font-mono text-[10px] tracking-widest text-concrete">
              SKU {formatSku(product.id)}
            </span>
            {images[activeImage] ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-contain p-10"
              />
            ) : (
              <span className="font-display text-8xl text-concrete-light">
                {product.brand?.[0] ?? '?'}
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImage ? 'border-volt' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos + sélection */}
        <div>
          <p className="font-mono text-xs tracking-widest text-volt uppercase mb-2">
            {product.brand}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl leading-tight mb-4">
            {product.name}
          </h1>
          <p className="font-display text-2xl mb-6">
            {product.price?.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span>
          </p>

          {product.description && (
            <p className="font-body text-sm text-concrete leading-relaxed mb-8">
              {product.description}
            </p>
          )}

          <div className="perforation mb-8" />

          {/* Taille */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <p className="font-mono text-[10px] tracking-widest text-concrete mb-2.5">TAILLE</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const available = variants.some((v) => v.size === size && v.stock > 0)
                  const isActive = (selectedSize ?? sizes[0]) === size
                  return (
                    <button
                      key={size}
                      disabled={!available}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3rem] px-3 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                        isActive
                          ? 'bg-ink text-bone border-ink'
                          : available
                          ? 'border-ink/15 hover:border-ink'
                          : 'border-ink/5 text-concrete-light line-through cursor-not-allowed'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Couleur */}
          {colors.length > 0 && (
            <div className="mb-6">
              <p className="font-mono text-[10px] tracking-widest text-concrete mb-2.5">COULEUR</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const isActive = (selectedColor ?? colors[0]) === color
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-2.5 rounded-lg text-sm font-semibold border transition-colors capitalize ${
                        isActive ? 'bg-ink text-bone border-ink' : 'border-ink/15 hover:border-ink'
                      }`}
                    >
                      {color}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantité */}
          <div className="mb-8">
            <p className="font-mono text-[10px] tracking-widest text-concrete mb-2.5">QUANTITÉ</p>
            <div className="inline-flex items-center border border-ink/15 rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-bone-dim transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(stockForSelection || 1, q + 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-bone-dim transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            {matchingVariant && (
              <span className="ml-3 text-xs font-mono text-concrete">
                {stockForSelection > 0 ? `${stockForSelection} en stock` : 'Rupture pour cette taille'}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            className="w-full bg-volt hover:bg-volt-dark text-white font-semibold text-sm py-4 rounded-full transition-colors disabled:bg-concrete-light disabled:cursor-not-allowed mb-6"
          >
            {stockForSelection > 0 ? 'Ajouter au panier' : 'Indisponible pour cette taille'}
          </button>

          <div className="flex flex-col gap-2.5 text-xs text-concrete font-body">
            <div className="flex items-center gap-2">
              <Truck size={14} />
              Livraison sous 24-48h à Cotonou
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} />
              Paiement à la livraison ou Mobile Money
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
