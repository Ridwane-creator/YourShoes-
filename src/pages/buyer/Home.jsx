import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchX, PackageSearch } from 'lucide-react'
import Hero from '../../components/landing/Hero'
import FilterBar from '../../components/landing/FilterBar'
import ProductGrid from '../../components/landing/ProductGrid'
import { useProducts } from '../../hooks/useProducts'

const CATEGORY_LABELS = {
  homme: 'Homme',
  femme: 'Femme',
  enfant: 'Enfant',
  unisexe: 'Unisexe',
}

const EMPTY_FILTERS = { brands: [], sizes: [], colors: [], priceMin: '', priceMax: '' }

export default function Home() {
  const { products, loading, error } = useProducts()
  const [sort, setSort] = useState('recent')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim().toLowerCase() ?? ''
  const category = searchParams.get('category') ?? ''

  // Options réelles disponibles, dérivées du catalogue existant (pas de données mockées)
  const filterOptions = useMemo(() => {
    const brands = new Set()
    const sizes = new Set()
    const colors = new Set()
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand)
      ;(p.product_variants ?? []).forEach((v) => {
        if (v.size) sizes.add(v.size)
        if (v.color) colors.add(v.color)
      })
    })
    return {
      brands: [...brands].sort(),
      sizes: [...sizes].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
      colors: [...colors].sort(),
    }
  }, [products])

  const filteredProducts = useMemo(() => {
    let list = products

    if (category) list = list.filter((p) => p.category === category)
    if (query) {
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
      )
    }
    if (filters.brands.length) {
      list = list.filter((p) => filters.brands.includes(p.brand))
    }
    if (filters.sizes.length) {
      list = list.filter((p) =>
        (p.product_variants ?? []).some((v) => filters.sizes.includes(v.size))
      )
    }
    if (filters.colors.length) {
      list = list.filter((p) =>
        (p.product_variants ?? []).some((v) => filters.colors.includes(v.color))
      )
    }
    if (filters.priceMin) {
      list = list.filter((p) => p.price >= Number(filters.priceMin))
    }
    if (filters.priceMax) {
      list = list.filter((p) => p.price <= Number(filters.priceMax))
    }

    return list
  }, [products, query, category, filters])

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    if (sort === 'price_asc') return list.sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') return list.sort((a, b) => b.price - a.price)
    return list
  }, [filteredProducts, sort])

  const hasActiveFilters =
    filters.brands.length || filters.sizes.length || filters.colors.length || filters.priceMin || filters.priceMax
  const isFiltering = Boolean(query || category || hasActiveFilters)

  const heading = query
    ? `"${searchParams.get('q')}"`
    : category
    ? `BASKETS ${CATEGORY_LABELS[category]?.toUpperCase() ?? ''}`
    : 'BASKETS POUR TOI'

  const minPrice = useMemo(() => {
    if (!products.length) return null
    return Math.min(...products.map((p) => p.price))
  }, [products])

  return (
    <>
      {!isFiltering && <Hero minPrice={minPrice} />}

      <section id="catalogue" className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="pt-12">
          <p className="font-mono text-xs tracking-widest text-volt mb-2">
            {query ? 'RÉSULTATS' : category ? 'CATÉGORIE' : 'CATALOGUE'}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl">{heading}</h2>
        </div>

        <FilterBar
          sort={sort}
          onSortChange={setSort}
          options={filterOptions}
          filters={filters}
          onChange={setFilters}
        />

        {!loading && !sortedProducts.length ? (
          query ? (
            <div className="py-20 flex flex-col items-center text-center">
              <SearchX size={40} className="text-concrete-light mb-4" strokeWidth={1.5} />
              <p className="font-display text-xl mb-1">AUCUN RÉSULTAT</p>
              <p className="font-body text-sm text-concrete max-w-sm">
                Aucune basket ne correspond à "{searchParams.get('q')}". Essaie une autre marque ou un autre nom.
              </p>
            </div>
          ) : isFiltering ? (
            <div className="py-20 flex flex-col items-center text-center">
              <PackageSearch size={40} className="text-concrete-light mb-4" strokeWidth={1.5} />
              <p className="font-display text-xl mb-1">AUCUN RÉSULTAT</p>
              <p className="font-body text-sm text-concrete max-w-sm">
                Aucune basket ne correspond à ces filtres. Essaie d'en retirer un.
              </p>
            </div>
          ) : (
            <ProductGrid products={sortedProducts} loading={loading} error={error} />
          )
        ) : (
          <ProductGrid products={sortedProducts} loading={loading} error={error} />
        )}
      </section>
    </>
  )
}
