'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase/client'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique']

const CATEGORIES = [
  { label: 'Vêtements', slug: 'vetements' },
  { label: 'Bijoux & Montres', slug: 'bijoux-montres' },
  { label: 'Beauté', slug: 'beaute' },
  { label: 'Chaussures', slug: 'chaussures' },
]

export function ProductForm() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '',
    categorySlug: '',
    price: '',
    comparePrice: '',
    stock: '0',
    description: '',
    isActive: true,
    isNew: false,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const target = e.target as HTMLInputElement
    const value = target.type === 'checkbox' ? target.checked : target.value
    setForm({ ...form, [target.name]: value })
  }

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')
    const urls: string[] = []

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file)

      if (uploadError) {
        setError('Erreur lors de l\'upload : ' + uploadError.message)
        continue
      }

      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
      urls.push(data.publicUrl)
    }

    setImageUrls((prev) => [...prev, ...urls])
    setUploading(false)
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url))
  }

  async function handleSubmit() {
    if (!form.name || !form.price || !form.categorySlug) {
      setError('Veuillez remplir les champs obligatoires : nom, catégorie, prix.')
      return
    }

    setSaving(true)
    setError('')

    // Get category id
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', form.categorySlug)
      .single()

    const catData = category as { id: string } | null

    const slug = form.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const { error: insertError } = await supabase.from('products').insert({
      name: form.name,
      slug: `${slug}-${Date.now()}`,
      description: form.description || null,
      price: parseInt(form.price),
      compare_price: form.comparePrice ? parseInt(form.comparePrice) : null,
      category_id: catData?.id || null,
      images: imageUrls,
      sizes: selectedSizes,
      stock: parseInt(form.stock) || 0,
      is_active: form.isActive,
      is_new: form.isNew,
    } as never)

    if (insertError) {
      setError('Erreur : ' + insertError.message)
      setSaving(false)
      return
    }

    router.push('/admin/produits')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Photo upload */}
      <div>
        <p className="font-sans text-sm font-semibold text-on-surface mb-2">
          Photos du produit
        </p>
        <label className="block border-2 border-dashed border-secondary-container rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors bg-surface-rose/30">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="text-primary animate-spin" />
              <p className="font-sans text-sm text-on-surface-variant">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload size={24} className="text-outline" strokeWidth={1.5} />
              <p className="font-sans text-sm text-on-surface-variant">
                Glisser-déposer ou <span className="text-primary font-medium">cliquer</span>
              </p>
              <p className="font-sans text-xs text-outline">JPG, PNG, WebP</p>
            </div>
          )}
        </label>
        {imageUrls.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            {imageUrls.map((url) => (
              <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden">
                <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                <button
                  onClick={() => removeImage(url)}
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">
          Nom du produit <span className="text-primary">*</span>
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="ex : Robe Bazin Awa"
          className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Category */}
      <div>
        <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">
          Catégorie <span className="text-primary">*</span>
        </label>
        <select
          name="categorySlug"
          value={form.categorySlug}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface border border-transparent focus:border-primary focus:outline-none transition-colors appearance-none"
        >
          <option value="">Sélectionner une catégorie</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Price */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">
            Prix FCFA <span className="text-primary">*</span>
          </label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="45000"
            className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">
            Prix barré (optionnel)
          </label>
          <input
            name="comparePrice"
            type="number"
            value={form.comparePrice}
            onChange={handleChange}
            placeholder="60000"
            className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Stock */}
      <div>
        <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">Stock</label>
        <input
          name="stock"
          type="number"
          value={form.stock}
          onChange={handleChange}
          placeholder="10"
          className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description du produit..."
          rows={3}
          className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Sizes */}
      <div>
        <label className="font-sans text-sm font-semibold text-on-surface block mb-2">
          Tailles disponibles
        </label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`rounded-full px-4 py-2 text-sm font-sans font-semibold transition-all border ${
                selectedSizes.includes(size)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface-rose text-on-surface border-transparent hover:border-primary/30'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="sr-only"
          />
          <div className={`w-10 h-6 rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-outline-variant'}`}>
            <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
          </div>
          <span className="font-sans text-sm text-on-surface">Produit actif</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isNew"
            checked={form.isNew}
            onChange={handleChange}
            className="sr-only"
          />
          <div className={`w-10 h-6 rounded-full transition-colors ${form.isNew ? 'bg-primary' : 'bg-outline-variant'}`}>
            <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${form.isNew ? 'translate-x-5' : 'translate-x-1'}`} />
          </div>
          <span className="font-sans text-sm text-on-surface">Badge &quot;NOUVEAU&quot;</span>
        </label>
      </div>

      {error && (
        <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>
      )}

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Enregistrement...
          </span>
        ) : (
          'Enregistrer le produit'
        )}
      </Button>
    </div>
  )
}
