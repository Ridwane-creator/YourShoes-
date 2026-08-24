import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, SlidersHorizontal, X, Tag } from 'lucide-react'

function useOutsideClick(ref, onOutside) {
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [ref, onOutside])
}

function CheckboxList({ options, selected, onToggle }) {
  if (!options.length) {
    return <p className="text-xs text-concrete px-1 py-2">Aucune option disponible.</p>
  }
  return (
    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-bone-dim cursor-pointer text-sm capitalize"
        >
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => onToggle(opt)}
            className="accent-volt"
          />
          {opt}
        </label>
      ))}
    </div>
  )
}

export default function FilterBar({ sort, onSortChange, options, filters, onChange }) {
  const [openPanel, setOpenPanel] = useState(null) // 'all' | 'brand' | 'size' | 'color' | 'price' | null
  const panelRef = useRef(null)
  useOutsideClick(panelRef, () => setOpenPanel(null))

  const activeCount =
    filters.brands.length +
    filters.sizes.length +
    filters.colors.length +
    (filters.priceMin || filters.priceMax ? 1 : 0)

  function toggleValue(key, value) {
    const current = filters[key]
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onChange({ ...filters, [key]: next })
  }

  function setPrice(field, value) {
    onChange({ ...filters, [field]: value })
  }

  function clearAll() {
    onChange({ brands: [], sizes: [], colors: [], priceMin: '', priceMax: '' })
    setOpenPanel(null)
  }

  const FILTER_BUTTONS = [
    { key: 'brand', label: 'Marque', count: filters.brands.length },
    { key: 'size', label: 'Taille', count: filters.sizes.length },
    { key: 'price', label: 'Prix', count: filters.priceMin || filters.priceMax ? 1 : 0 },
    { key: 'color', label: 'Couleur', count: filters.colors.length },
  ]

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-3 py-5 border-b border-ink/10" ref={panelRef}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setOpenPanel(openPanel === 'all' ? null : 'all')}
          className={`flex items-center gap-1.5 border rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            openPanel === 'all' ? 'border-ink bg-ink text-bone' : 'border-ink/15 hover:border-ink'
          }`}
        >
          <SlidersHorizontal size={13} />
          Tous les filtres
          {activeCount > 0 && (
            <span className="bg-volt text-white text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {FILTER_BUTTONS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setOpenPanel(openPanel === key ? null : key)}
            className={`flex items-center gap-1 border rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              openPanel === key ? 'border-ink bg-ink text-bone' : 'border-ink/15 hover:border-ink'
            }`}
          >
            {label}
            {count > 0 && (
              <span className="bg-volt text-white text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
            <ChevronDown size={13} />
          </button>
        ))}

        <button
          disabled
          title="Bientôt disponible — aucune offre en cours"
          className="flex items-center gap-1 border border-ink/10 rounded-full px-4 py-2 text-xs font-semibold text-concrete-light cursor-not-allowed"
        >
          <Tag size={12} />
          Offres
        </button>

        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs font-semibold text-concrete hover:text-ink transition-colors px-2"
          >
            <X size={13} />
            Effacer
          </button>
        )}
      </div>

      <label className="flex items-center gap-2 text-xs font-semibold">
        Trier par
        <select
          value={sort}
          onChange={(e) => onSortChange?.(e.target.value)}
          className="border border-ink/15 rounded-full px-3 py-2 bg-white outline-none cursor-pointer"
        >
          <option value="recent">Nouveautés</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
        </select>
      </label>

      {/* Panneau déroulant */}
      {openPanel && (
        <div className="absolute top-full left-0 mt-2 z-30 bg-white border border-ink/10 rounded-2xl shadow-xl p-5 w-full max-w-md">
          {(openPanel === 'all' || openPanel === 'brand') && (
            <div className="mb-4">
              <p className="font-mono text-[10px] tracking-widest text-concrete mb-2">MARQUE</p>
              <CheckboxList
                options={options.brands}
                selected={filters.brands}
                onToggle={(v) => toggleValue('brands', v)}
              />
            </div>
          )}
          {(openPanel === 'all' || openPanel === 'size') && (
            <div className="mb-4">
              <p className="font-mono text-[10px] tracking-widest text-concrete mb-2">TAILLE</p>
              <div className="flex flex-wrap gap-2">
                {options.sizes.length ? (
                  options.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleValue('sizes', size)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                        filters.sizes.includes(size)
                          ? 'bg-ink text-bone border-ink'
                          : 'border-ink/15 hover:border-ink'
                      }`}
                    >
                      {size}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-concrete">Aucune taille disponible.</p>
                )}
              </div>
            </div>
          )}
          {(openPanel === 'all' || openPanel === 'color') && (
            <div className="mb-4">
              <p className="font-mono text-[10px] tracking-widest text-concrete mb-2">COULEUR</p>
              <div className="flex flex-wrap gap-2">
                {options.colors.length ? (
                  options.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => toggleValue('colors', color)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border capitalize transition-colors ${
                        filters.colors.includes(color)
                          ? 'bg-ink text-bone border-ink'
                          : 'border-ink/15 hover:border-ink'
                      }`}
                    >
                      {color}
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-concrete">Aucune couleur disponible.</p>
                )}
              </div>
            </div>
          )}
          {(openPanel === 'all' || openPanel === 'price') && (
            <div>
              <p className="font-mono text-[10px] tracking-widest text-concrete mb-2">PRIX (FCFA)</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  value={filters.priceMin}
                  onChange={(e) => setPrice('priceMin', e.target.value)}
                  placeholder="Min"
                  className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-volt"
                />
                <span className="text-concrete">—</span>
                <input
                  type="number"
                  min={0}
                  value={filters.priceMax}
                  onChange={(e) => setPrice('priceMax', e.target.value)}
                  placeholder="Max"
                  className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-volt"
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setOpenPanel(null)}
            className="w-full mt-5 bg-volt hover:bg-volt-dark text-white font-semibold text-sm py-2.5 rounded-full transition-colors"
          >
            Voir les résultats
          </button>
        </div>
      )}
    </div>
  )
}
