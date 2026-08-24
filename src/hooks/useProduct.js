import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useProduct(id) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    let isMounted = true

    async function fetchProduct() {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*, product_variants(*)')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (!isMounted) return

      if (fetchError) {
        setError(fetchError.message)
        setProduct(null)
      } else {
        setProduct(data)
      }
      setLoading(false)
    }

    fetchProduct()
    return () => {
      isMounted = false
    }
  }, [id])

  return { product, loading, error }
}
