import { useState } from 'react'
import Papa from 'papaparse'
import { z } from 'zod'
import { Upload, Download, AlertTriangle, CheckCircle2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'

const VALID_COLORS = [
  'noir', 'blanc', 'gris', 'rouge', 'bleu', 'vert', 'jaune', 'orange',
  'rose', 'violet', 'marron', 'beige', 'doré', 'argenté', 'turquoise',
  'bordeaux', 'kaki', 'corail', 'saumon', 'marine', 'ivoire', 'crème',
  'multicolore', 'camel', 'taupe',
]

const MAX_SHOE_SIZE = 46

const rowSchema = z
  .object({
    nom: z.string().min(2, 'Nom trop court'),
    marque: z.string().min(1, 'Marque requise'),
    prix: z.coerce.number().positive('Prix invalide'),
    categorie: z.enum(['homme', 'femme', 'enfant', 'unisexe'], {
      errorMap: () => ({ message: 'Doit être homme, femme, enfant ou unisexe' }),
    }),
    description: z.string().optional(),
    tailles: z.string().min(1, 'Au moins une taille requise'),
    couleurs: z.string().optional(),
    stock: z.coerce.number().min(0, 'Stock invalide'),
    image_url: z
      .string()
      .url('URL invalide')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (row) => {
      const sizes = row.tailles.split('|').map((s) => s.trim()).filter(Boolean)
      return sizes.every((s) => {
        const num = Number(s)
        return !Number.isNaN(num) && num > 0 && num <= MAX_SHOE_SIZE
      })
    },
    { message: `Chaque taille doit être un nombre valide entre 1 et ${MAX_SHOE_SIZE}`, path: ['tailles'] }
  )
  .refine(
    (row) => {
      if (!row.couleurs) return true
      const colors = row.couleurs.split('|').map((c) => c.trim()).filter(Boolean)
      return colors.every((c) => VALID_COLORS.includes(c.toLowerCase()))
    },
    { message: `Couleurs non reconnues. Utilise : ${VALID_COLORS.slice(0, 8).join(', ')}...`, path: ['couleurs'] }
  )

const TEMPLATE_CSV = `nom,marque,prix,categorie,description,tailles,couleurs,stock,image_url
Air Max 270,Nike,45000,homme,Basket légère et confortable,40|41|42|43,noir|blanc,5,https://exemple.com/photo.jpg
Superstar,Adidas,38000,unisexe,Modèle iconique,38|39|40,blanc,3,`

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'modele-import-sneakstore.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function CsvImport({ onSuccess, onClose }) {
  const [validRows, setValidRows] = useState([])
  const [errorRows, setErrorRows] = useState([])
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const valid = []
        const errors = []

        results.data.forEach((row, i) => {
          const parsed = rowSchema.safeParse(row)
          if (parsed.success) {
            valid.push(parsed.data)
          } else {
            errors.push({
              line: i + 2, // +2 : ligne 1 = en-têtes, index commence à 0
              nom: row.nom || '(sans nom)',
              messages: parsed.error.issues.map((iss) => iss.message),
            })
          }
        })

        setValidRows(valid)
        setErrorRows(errors)
      },
      error: () => {
        toast.error('Impossible de lire ce fichier CSV.')
      },
    })
  }

  async function handleImport() {
    setImporting(true)
    let success = 0
    let failed = 0

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i]
      try {
        const { data: product, error: productError } = await supabase
          .from('products')
          .insert({
            name: row.nom,
            brand: row.marque,
            description: row.description || null,
            price: row.prix,
            category: row.categorie,
            images: row.image_url ? [row.image_url] : [],
            is_active: true,
          })
          .select()
          .single()

        if (productError) throw productError

        const sizes = row.tailles.split('|').map((s) => s.trim()).filter(Boolean)
        const colors = (row.couleurs ?? '').split('|').map((c) => c.trim()).filter(Boolean)
        const combos = colors.length
          ? sizes.flatMap((size) => colors.map((color) => ({ size, color })))
          : sizes.map((size) => ({ size, color: null }))

        const { error: variantsError } = await supabase.from('product_variants').insert(
          combos.map((c) => ({ ...c, product_id: product.id, stock: row.stock }))
        )
        if (variantsError) throw variantsError

        success++
      } catch (err) {
        failed++
      }
      setProgress(i + 1)
    }

    setImporting(false)
    if (failed === 0) {
      toast.success(`${success} produit(s) importé(s) avec succès !`)
    } else {
      toast.error(`${success} importé(s), ${failed} en échec.`)
    }
    onSuccess?.()
  }

  return (
    <div className="bg-white border border-ink/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[10px] tracking-widest text-volt">IMPORT EN MASSE (CSV)</p>
        <button onClick={onClose} className="text-concrete hover:text-ink transition-colors">
          <X size={16} />
        </button>
      </div>

      <p className="text-xs text-concrete mb-4">
        Une ligne = un produit. Sépare plusieurs tailles/couleurs avec le caractère{' '}
        <code className="bg-bone-dim px-1 rounded">|</code> (ex: 40|41|42). Le lien photo est
        optionnel — utilise un lien direct vers une image (imgur, cloudinary…), pas un lien
        Google Drive de partage. Sans lien, tu pourras ajouter la photo manuellement après import.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 border border-ink/15 rounded-full px-4 py-2.5 text-xs font-semibold hover:border-ink transition-colors"
        >
          <Download size={14} />
          Télécharger le modèle CSV
        </button>

        <label className="flex items-center gap-1.5 bg-ink text-bone rounded-full px-4 py-2.5 text-xs font-semibold cursor-pointer hover:bg-ink-soft transition-colors">
          <Upload size={14} />
          {fileName || 'Choisir un fichier CSV'}
          <input type="file" accept=".csv" hidden onChange={handleFile} />
        </label>
      </div>

      {(validRows.length > 0 || errorRows.length > 0) && (
        <div className="flex flex-col gap-3 mb-6">
          {validRows.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-ink">
              <CheckCircle2 size={16} className="text-volt" />
              <span className="font-semibold">{validRows.length} produit(s) prêt(s) à importer</span>
            </div>
          )}
          {errorRows.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
                <AlertTriangle size={16} />
                <span className="font-semibold">{errorRows.length} ligne(s) ignorée(s)</span>
              </div>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto bg-red-50 rounded-lg p-3">
                {errorRows.map((e) => (
                  <p key={e.line} className="text-xs text-red-700">
                    Ligne {e.line} ({e.nom}) : {e.messages.join(', ')}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {importing && (
        <p className="text-xs font-mono text-concrete mb-4">
          Import en cours… {progress}/{validRows.length}
        </p>
      )}

      <button
        onClick={handleImport}
        disabled={!validRows.length || importing}
        className="bg-volt hover:bg-volt-dark text-white font-semibold text-sm px-6 py-3 rounded-full transition-colors disabled:opacity-50"
      >
        {importing ? 'Import en cours…' : `Importer ${validRows.length || ''} produit(s)`}
      </button>
    </div>
  )
}
