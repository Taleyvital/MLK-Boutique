'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Product, Category } from '@/lib/supabase/types'

export function useProducts(categorySlug?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      let query = supabase
        .from('products')
        .select('*, categories(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (categorySlug && categorySlug !== 'tout') {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single()
        const catData = cat as { id: string } | null
        if (catData) {
          query = query.eq('category_id', catData.id)
        }
      }

      const { data, error } = await query
      if (error) setError(error.message)
      else setProducts(data as Product[])
      setLoading(false)
    }

    fetchProducts()
  }, [categorySlug])

  return { products, loading, error }
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
      setProduct(data as unknown as Product)
      setLoading(false)
    }
    fetchProduct()
  }, [slug])

  return { product, loading }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')
      setCategories(data || [])
      setLoading(false)
    }
    fetchCategories()
  }, [])

  return { categories, loading }
}
