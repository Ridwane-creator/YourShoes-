import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Récupère les produits actifs avec leurs variantes (taille/couleur/stock)
 * directement depuis Supabase. Pas de données mockées : tant que la table
 * `products` est vide, la grille reste vide (voir état "empty" dans ProductGrid).
 */
export function useProducts({ category, brand, includeInactive = false } = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchProducts() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('products')
        .select('*, product_variants(*)')
        .order('created_at', { ascending: false })

      if (!includeInactive) query = query.eq('is_active', true)
      if (category) query = query.eq('category', category)
      if (brand) query = query.eq('brand', brand)

      const { data, error: fetchError } = await query

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
        setProducts([])
      } else {
        setProducts(data ?? [])
      }
      setLoading(false)
    }

    fetchProducts()
    return () => {
      isMounted = false
    }
  }, [category, brand, includeInactive])

  return { products, loading, error }
}
