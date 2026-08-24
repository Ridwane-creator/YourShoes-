import { useMemo, useState } from 'react'
import { Plus, X, Search, Copy, ImagePlus, FileUp } from 'lucide-react'
import ProductForm from '../../components/admin/ProductForm'
import CsvImport from '../../components/admin/CsvImport'
import ProductImagesModal from '../../components/admin/ProductImagesModal'
import { useProducts } from '../../hooks/useProducts'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const { products, loading, error } = useProducts({ includeInactive: true })
  const [formOpen, setFormOpen] = useState(false)
  const [csvOpen, setCsvOpen] = useState(false)
  const [duplicateSource, setDuplicateSource] = useState(null)
  const [imagesModalProduct, setImagesModalProduct] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState('')

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
    )
  }, [products, search])

  async function toggleActive(product) {
    const { error: err } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)
    if (err) {
      toast.error("Impossible de mettre à jour le produit")
      return
    }
    toast.success(product.is_active ? 'Produit retiré du catalogue' : 'Produit republié')
    setRefreshKey((k) => k + 1)
  }

  function openDuplicateForm(product) {
    const variants = product.product_variants ?? []
    setDuplicateSource({
      name: `${product.name} (copie)`,
      brand: product.brand,
      price: product.price,
      category: product.category,
      description: product.description ?? '',
      sizes: [...new Set(variants.map((v) => v.size))],
      colors: [...new Set(variants.map((v) => v.color).filter(Boolean))],
    })
    setCsvOpen(false)
    setFormOpen(true)
  }

  function openBlankForm() {
    setDuplicateSource(null)
    setCsvOpen(false)
    setFormOpen((o) => !o)
  }

  function openCsvImport() {
    setFormOpen(false)
    setCsvOpen((o) => !o)
  }

  return (
    <div className="p-8 max-w-5xl" key={refreshKey}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-volt mb-1">GESTION</p>
          <h1 className="font-display text-3xl">PRODUITS</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openCsvImport}
            className="flex items-center gap-2 border border-ink/15 font-semibold text-sm px-5 py-3 rounded-full hover:border-ink transition-colors"
          >
            <FileUp size={16} />
            Importer CSV
          </button>
          <button
            onClick={openBlankForm}
            className="flex items-center gap-2 bg-ink text-bone font-semibold text-sm px-5 py-3 rounded-full hover:bg-ink-soft transition-colors"
          >
            {formOpen ? <X size={16} /> : <Plus size={16} />}
            {formOpen ? 'Fermer' : 'Déposer un produit'}
          </button>
        </div>
      </div>

      {csvOpen && (
        <div className="mb-10">
          <CsvImport
            onClose={() => setCsvOpen(false)}
            onSuccess={() => setRefreshKey((k) => k + 1)}
          />
        </div>
      )}

      {formOpen && (
        <div className="mb-10">
          <ProductForm
            initialValues={duplicateSource}
            onSuccess={() => {
              setFormOpen(false)
              setDuplicateSource(null)
              setRefreshKey((k) => k + 1)
            }}
          />
        </div>
      )}

      {!formOpen && !csvOpen && (
        <div className="flex items-center gap-2.5 bg-white border border-ink/15 rounded-full px-4 h-11 mb-6 max-w-sm">
          <Search size={16} className="text-concrete shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chercher un produit, une marque…"
            className="w-full bg-transparent outline-none text-sm font-body placeholder:text-concrete"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-concrete hover:text-ink transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {loading && <p className="font-mono text-sm text-concrete">Chargement…</p>}
      {error && <p className="font-mono text-sm text-red-600">Erreur de chargement.</p>}

      {!loading && !error && !products.length && (
        <p className="font-mono text-sm text-concrete py-10 text-center">
          Aucun produit déposé pour le moment.
        </p>
      )}

      {!loading && products.length > 0 && !filteredProducts.length && (
        <p className="font-mono text-sm text-concrete py-10 text-center">
          Aucun produit ne correspond à "{search}".
        </p>
      )}

      {!loading && filteredProducts.length > 0 && (
        <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left font-mono text-[10px] tracking-widest text-concrete">
                <th className="px-5 py-3 font-semibold">Produit</th>
                <th className="px-5 py-3 font-semibold">Marque</th>
                <th className="px-5 py-3 font-semibold">Prix</th>
                <th className="px-5 py-3 font-semibold">Variantes</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const totalStock = (p.product_variants ?? []).reduce((s, v) => s + v.stock, 0)
                return (
                  <tr key={p.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-5 py-3.5 font-semibold">{p.name}</td>
                    <td className="px-5 py-3.5 text-concrete">{p.brand}</td>
                    <td className="px-5 py-3.5 font-mono">{p.price?.toLocaleString('fr-FR')} FCFA</td>
                    <td className="px-5 py-3.5 text-concrete">
                      {(p.product_variants ?? []).length} taille(s) · {totalStock} en stock
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-mono tracking-widest px-2.5 py-1 rounded-full ${
                          p.is_active ? 'bg-tag/40 text-ink' : 'bg-concrete-light text-ink/60'
                        }`}
                      >
                        {p.is_active ? 'PUBLIÉ' : 'MASQUÉ'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setImagesModalProduct(p)}
                          className="flex items-center gap-1 text-xs font-semibold text-concrete hover:text-ink transition-colors"
                        >
                          <ImagePlus size={13} />
                          Photos
                        </button>
                        <button
                          onClick={() => openDuplicateForm(p)}
                          className="flex items-center gap-1 text-xs font-semibold text-concrete hover:text-ink transition-colors"
                        >
                          <Copy size={13} />
                          Dupliquer
                        </button>
                        <button
                          onClick={() => toggleActive(p)}
                          className="text-xs font-semibold text-volt hover:text-volt-dark"
                        >
                          {p.is_active ? 'Retirer' : 'Republier'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {imagesModalProduct && (
        <ProductImagesModal
          product={imagesModalProduct}
          onClose={() => setImagesModalProduct(null)}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  )
}
