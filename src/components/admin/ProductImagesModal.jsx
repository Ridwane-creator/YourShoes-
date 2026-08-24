import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'

export default function ProductImagesModal({ product, onClose, onSaved }) {
  const [existingImages, setExistingImages] = useState(product.images ?? [])
  const [newFiles, setNewFiles] = useState([])
  const [newPreviews, setNewPreviews] = useState([])
  const [saving, setSaving] = useState(false)

  function handleFileChange(e) {
    const files = Array.from(e.target.files ?? [])
    setNewFiles((prev) => [...prev, ...files])
    setNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
  }

  function removeExisting(url) {
    setExistingImages((prev) => prev.filter((img) => img !== url))
  }

  function removeNew(index) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
    setNewPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const uploadedUrls = []
      for (const file of newFiles) {
        const path = `${product.id}/${crypto.randomUUID()}-${file.name}`
        const { error } = await supabase.storage.from('product-images').upload(path, file)
        if (error) throw error
        const { data } = supabase.storage.from('product-images').getPublicUrl(path)
        uploadedUrls.push(data.publicUrl)
      }

      const finalImages = [...existingImages, ...uploadedUrls]
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: finalImages })
        .eq('id', product.id)
      if (updateError) throw updateError

      toast.success('Photos mises à jour')
      onSaved?.()
      onClose()
    } catch (err) {
      toast.error(`Erreur : ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-volt mb-1">PHOTOS</p>
            <h3 className="font-display text-lg">{product.name}</h3>
          </div>
          <button onClick={onClose} className="text-concrete hover:text-ink transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          {existingImages.map((url) => (
            <div key={url} className="relative w-24 h-24 rounded-lg overflow-hidden border border-ink/10">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeExisting(url)}
                className="absolute top-1 right-1 w-5 h-5 bg-ink text-bone rounded-full flex items-center justify-center"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          {newPreviews.map((src, i) => (
            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-tag border-2">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeNew(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-ink text-bone rounded-full flex items-center justify-center"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <label className="w-24 h-24 rounded-lg border-2 border-dashed border-ink/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-volt transition-colors">
            <Upload size={18} className="text-concrete" />
            <span className="text-[10px] text-concrete font-semibold">Ajouter</span>
            <input type="file" accept="image/*" multiple hidden onChange={handleFileChange} />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-ink/15 font-semibold text-sm py-2.5 rounded-full hover:border-ink transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-volt hover:bg-volt-dark text-white font-semibold text-sm py-2.5 rounded-full transition-colors disabled:opacity-60"
          >
            {saving ? 'Sauvegarde…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
