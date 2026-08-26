import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'

const productSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  brand: z.string().min(1, 'Requis'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Le prix doit être supérieur à 0'),
  category: z.enum(['homme', 'femme', 'enfant', 'unisexe']),
})

const CATEGORIES = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'enfant', label: 'Enfant' },
  { value: 'unisexe', label: 'Unisexe' },
]

const VALID_COLORS = [
  'noir', 'blanc', 'gris', 'rouge', 'bleu', 'vert', 'jaune', 'orange',
  'rose', 'violet', 'marron', 'beige', 'doré', 'argenté', 'turquoise',
  'bordeaux', 'kaki', 'corail', 'saumon', 'marine', 'ivoire', 'crème',
  'multicolore', 'camel', 'taupe',
]

const MAX_SHOE_SIZE = 46

// Petit champ "à puces" réutilisable : tape une valeur, Entrée pour l'ajouter.
// `validate` est optionnel : (value) => true | "message d'erreur"
function ChipInput({ label, placeholder, values, onChange, validate }) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')

  function addChip() {
    const value = draft.trim()
    if (!value) {
      setDraft('')
      return
    }
    if (validate) {
      const result = validate(value)
      if (result !== true) {
        setError(result)
        setDraft('')
        return
      }
    }
    if (values.includes(value)) {
      setDraft('')
      return
    }
    setError('')
    onChange([...values, value])
    setDraft('')
  }

  function removeChip(value) {
    onChange(values.filter((v) => v !== value))
  }

  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 bg-ink text-bone text-xs font-semibold px-3 py-1.5 rounded-full capitalize"
          >
            {v}
            <button type="button" onClick={() => removeChip(v)} className="hover:text-tag">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value)
          if (error) setError('')
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addChip()
          }
        }}
        onBlur={addChip}
        placeholder={placeholder}
        className="w-full border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-volt"
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

export default function ProductForm({ onSuccess, initialValues }) {
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [sizes, setSizes] = useState(initialValues?.sizes ?? [])
  const [colors, setColors] = useState(initialValues?.colors ?? [])
  const [stockGrid, setStockGrid] = useState({}) // clé "taille||couleur" -> stock
  const [variantsError, setVariantsError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: initialValues?.category ?? 'homme',
      name: initialValues?.name ?? '',
      brand: initialValues?.brand ?? '',
      price: initialValues?.price ?? undefined,
      description: initialValues?.description ?? '',
    },
  })

  // Combinaisons taille × couleur (ou juste tailles si aucune couleur précisée)
  const combinations = useMemo(() => {
    if (!sizes.length) return []
    if (!colors.length) return sizes.map((size) => ({ size, color: null }))
    return sizes.flatMap((size) => colors.map((color) => ({ size, color })))
  }, [sizes, colors])

  function updateStock(key, value) {
    setStockGrid((prev) => ({ ...prev, [key]: value }))
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files ?? [])
    setImageFiles((prev) => [...prev, ...files])
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
  }

  function removeImage(index) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function uploadImages(productId) {
    const urls = []
    for (const file of imageFiles) {
      const path = `${productId}/${crypto.randomUUID()}-${file.name}`
      const { error } = await supabase.storage.from('product-images').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      urls.push(data.publicUrl)
    }
    return urls
  }

  async function onSubmit(values) {
    if (!combinations.length) {
      setVariantsError('Ajoute au moins une taille.')
      return
    }
    const variantsPayload = combinations.map(({ size, color }) => ({
      size,
      color,
      stock: Number(stockGrid[`${size}||${color}`] ?? 0),
    }))
    if (variantsPayload.every((v) => v.stock <= 0)) {
      setVariantsError('Renseigne un stock supérieur à 0 pour au moins une combinaison.')
      return
    }
    setVariantsError('')
    setSubmitting(true)

    try {
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: values.name,
          brand: values.brand,
          description: values.description || null,
          price: values.price,
          category: values.category,
          is_active: true,
        })
        .select()
        .single()

      if (productError) throw productError

      let imageUrls = []
      if (imageFiles.length) {
        imageUrls = await uploadImages(product.id)
        await supabase.from('products').update({ images: imageUrls }).eq('id', product.id)
      }

      const { error: variantsInsertError } = await supabase
        .from('product_variants')
        .insert(variantsPayload.map((v) => ({ ...v, product_id: product.id })))
      if (variantsInsertError) throw variantsInsertError

      toast.success('Produit déposé avec succès !')
      reset()
      setImageFiles([])
      setImagePreviews([])
      setSizes([])
      setColors([])
      setStockGrid({})
      onSuccess?.(product)
    } catch (err) {
      toast.error(`Erreur : ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {initialValues && (
        <div className="bg-tag/30 border border-tag rounded-2xl px-5 py-3 text-xs font-semibold">
          Produit dupliqué depuis "{initialValues.name}" — ajuste ce qui change, les photos et le stock sont à refaire.
        </div>
      )}

      {/* Infos générales */}
      <div className="bg-white border border-ink/10 rounded-2xl p-6">
        <p className="font-mono text-[10px] tracking-widest text-volt mb-4">INFOS PRODUIT</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5">Nom du modèle</label>
            <input
              {...register('name')}
              placeholder="Air Max 270"
              className="w-full border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-volt"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Marque</label>
            <input
              {...register('brand')}
              placeholder="Nike"
              className="w-full border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-volt"
            />
            {errors.brand && <p className="text-xs text-red-600 mt-1">{errors.brand.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Prix (FCFA)</label>
            <input
              type="number"
              {...register('price')}
              placeholder="45000"
              className="w-full border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-volt"
            />
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Catégorie</label>
            <select
              {...register('category')}
              className="w-full border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-volt bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1.5">Description (optionnel)</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Détails du modèle, matière, particularités…"
              className="w-full border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-volt resize-none"
            />
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="bg-white border border-ink/10 rounded-2xl p-6">
        <p className="font-mono text-[10px] tracking-widest text-volt mb-4">PHOTOS</p>
        <div className="flex flex-wrap gap-3">
          {imagePreviews.map((src, i) => (
            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-ink/10">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-ink text-bone rounded-full flex items-center justify-center"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <label className="w-24 h-24 rounded-lg border-2 border-dashed border-ink/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-volt transition-colors">
            <Upload size={18} className="text-concrete" />
            <span className="text-[10px] text-concrete font-semibold">Ajouter</span>
            <input type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
          </label>
        </div>
      </div>

      {/* Tailles / couleurs / stock */}
      <div className="bg-white border border-ink/10 rounded-2xl p-6">
        <p className="font-mono text-[10px] tracking-widest text-volt mb-4">TAILLES, COULEURS & STOCK</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <ChipInput
            label="Tailles disponibles"
            placeholder="Tape une taille (42) puis Entrée"
            values={sizes}
            onChange={setSizes}
            validate={(value) => {
              const num = Number(value)
              if (Number.isNaN(num)) return 'La taille doit être un nombre'
              if (num <= 0) return 'Taille invalide'
              if (num > MAX_SHOE_SIZE) return `La pointure ne peut pas dépasser ${MAX_SHOE_SIZE}`
              return true
            }}
          />
          <ChipInput
            label="Couleurs disponibles (optionnel)"
            placeholder="Tape une couleur (noir) puis Entrée"
            values={colors}
            onChange={setColors}
            validate={(value) => {
              if (!VALID_COLORS.includes(value.toLowerCase())) {
                return `Couleur non reconnue. Exemples : ${VALID_COLORS.slice(0, 6).join(', ')}...`
              }
              return true
            }}
          />
        </div>

        {combinations.length > 0 && (
          <div>
            <p className="font-mono text-[10px] tracking-widest text-concrete mb-2.5">
              STOCK PAR COMBINAISON
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {combinations.map(({ size, color }) => {
                const key = `${size}||${color}`
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-2 border border-ink/15 rounded-lg px-3 py-2"
                  >
                    <span className="text-xs font-semibold capitalize truncate">
                      {size}{color ? ` · ${color}` : ''}
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={stockGrid[key] ?? ''}
                      onChange={(e) => updateStock(key, e.target.value)}
                      placeholder="0"
                      className="w-16 border border-ink/15 rounded-md px-2 py-1 text-xs text-right outline-none focus:border-volt"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {variantsError && <p className="text-xs text-red-600 mt-3">{variantsError}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="self-start bg-volt hover:bg-volt-dark text-white font-semibold text-sm px-8 py-3.5 rounded-full transition-colors disabled:opacity-60"
      >
        {submitting ? 'Publication…' : 'Publier le produit'}
      </button>
    </form>
  )
}
