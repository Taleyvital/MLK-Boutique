'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2, Trash2, AlertTriangle, Link as LinkIcon } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase/client'
import type { Product } from '@/lib/supabase/types'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique']

const CATEGORIES = [
  { label: 'Vêtements',       slug: 'vetements' },
  { label: 'Bijoux & Montres', slug: 'bijoux-montres' },
  { label: 'Beauté',          slug: 'beaute' },
  { label: 'Chaussures',      slug: 'chaussures' },
]

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product

  const [uploading, setUploading]           = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [deleting, setDeleting]             = useState(false)
  const [confirmDelete, setConfirmDelete]   = useState(false)
  const [error, setError]                   = useState('')
  const [success, setSuccess]               = useState('')

  const [imageUrls, setImageUrls]           = useState<string[]>(product?.images ?? [])
  const [selectedSizes, setSelectedSizes]   = useState<string[]>(product?.sizes ?? [])

  const [form, setForm] = useState({
    name:            product?.name              ?? '',
    categorySlug:    '',
    price:           product?.price?.toString()         ?? '',
    comparePrice:    product?.compare_price?.toString() ?? '',
    stock:           product?.stock?.toString()         ?? '0',
    description:     product?.description      ?? '',
    isActive:        product?.is_active         ?? true,
    isNew:           product?.is_new            ?? false,
    wavePaymentUrl:  product?.wave_payment_url  ?? '',
  })

  // We need the category slug from the category_id — fetched lazily the first time
  const [catSlug, setCatSlug] = useState<string>('')
  const [catResolved, setCatResolved] = useState(false)

  async function resolveCategorySlug() {
    if (catResolved || !product?.category_id) { setCatResolved(true); return }
    const { data } = await supabase
      .from('categories')
      .select('slug')
      .eq('id', product.category_id)
      .single()
    const slug = (data as { slug: string } | null)?.slug ?? ''
    setCatSlug(slug)
    setForm(f => ({ ...f, categorySlug: slug }))
    setCatResolved(true)
  }

  // Resolve on first render (if editing)
  if (isEdit && !catResolved) resolveCategorySlug()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const target = e.target as HTMLInputElement
    const value  = target.type === 'checkbox' ? target.checked : target.value
    setForm(f => ({ ...f, [target.name]: value }))
  }

  function toggleSize(size: string) {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const ext      = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file)
      if (uploadError) { setError('Erreur upload : ' + uploadError.message); continue }
      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
      urls.push(data.publicUrl)
    }
    setImageUrls(prev => [...prev, ...urls])
    setUploading(false)
  }

  async function handleSubmit() {
    if (!form.name || !form.price || !form.categorySlug) {
      setError('Nom, catégorie et prix sont obligatoires.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')

    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', form.categorySlug)
      .single()
    const catId = (category as { id: string } | null)?.id ?? null

    const slug = form.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const payload = {
      name:              form.name,
      description:       form.description || null,
      price:             parseInt(form.price),
      compare_price:     form.comparePrice ? parseInt(form.comparePrice) : null,
      category_id:       catId,
      images:            imageUrls,
      sizes:             selectedSizes,
      stock:             parseInt(form.stock) || 0,
      is_active:         form.isActive,
      is_new:            form.isNew,
      wave_payment_url:  form.wavePaymentUrl.trim() || null,
    }

    if (isEdit) {
      const { error: updateError } = await supabase
        .from('products')
        .update(payload as never)
        .eq('id', product.id)
      if (updateError) { setError('Erreur : ' + updateError.message); setSaving(false); return }
      setSuccess('Produit mis à jour ✓')
      setSaving(false)
      router.refresh()
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert({ ...payload, slug: `${slug}-${Date.now()}` } as never)
      if (insertError) { setError('Erreur : ' + insertError.message); setSaving(false); return }
      router.push('/admin/produits')
      router.refresh()
    }
  }

  async function handleDelete() {
    setDeleting(true)
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', product!.id)
    if (deleteError) { setError('Erreur suppression : ' + deleteError.message); setDeleting(false); return }
    router.push('/admin/produits')
    router.refresh()
  }

  return (
    <div className="space-y-5">

      {/* Photo upload */}
      <div>
        <p className="font-sans text-sm font-semibold text-on-surface mb-2">Photos du produit</p>
        <label className="block border-2 border-dashed border-secondary-container rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors bg-surface-rose/30">
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
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
            {imageUrls.map((url, i) => (
              <div key={url} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-primary/70 text-white font-sans py-0.5">
                    Principale
                  </span>
                )}
                <button
                  onClick={() => setImageUrls(prev => prev.filter(u => u !== url))}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nom */}
      <div>
        <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">
          Nom du produit <span className="text-primary">*</span>
        </label>
        <input
          name="name" value={form.name} onChange={handleChange}
          placeholder="ex : Robe Bazin Awa"
          className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Catégorie */}
      <div>
        <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">
          Catégorie <span className="text-primary">*</span>
        </label>
        <select
          name="categorySlug" value={form.categorySlug} onChange={handleChange}
          className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface border border-transparent focus:border-primary focus:outline-none transition-colors appearance-none"
        >
          <option value="">Sélectionner une catégorie</option>
          {CATEGORIES.map(c => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Prix */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">
            Prix FCFA <span className="text-primary">*</span>
          </label>
          <input
            name="price" type="number" value={form.price} onChange={handleChange}
            placeholder="45000"
            className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">Prix barré</label>
          <input
            name="comparePrice" type="number" value={form.comparePrice} onChange={handleChange}
            placeholder="60000"
            className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Stock */}
      <div>
        <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">Stock</label>
        <input
          name="stock" type="number" value={form.stock} onChange={handleChange}
          placeholder="10"
          className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5">Description</label>
        <textarea
          name="description" value={form.description} onChange={handleChange}
          placeholder="Description du produit..." rows={3}
          className="w-full px-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Tailles */}
      <div>
        <label className="font-sans text-sm font-semibold text-on-surface block mb-2">Tailles disponibles</label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button
              key={size} type="button" onClick={() => toggleSize(size)}
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

      {/* Lien Wave */}
      <div>
        <label className="font-sans text-sm font-semibold text-on-surface block mb-1.5 flex items-center gap-2">
          <Image src="/moyen-paiement/wave.png" alt="Wave" width={18} height={18} className="rounded object-contain" />
          Lien de paiement Wave
        </label>
        <div className="relative">
          <LinkIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" strokeWidth={1.5} />
          <input
            name="wavePaymentUrl"
            type="url"
            value={form.wavePaymentUrl}
            onChange={handleChange}
            placeholder="https://pay.wave.com/m/..."
            className="w-full pl-9 pr-4 py-3 bg-surface-rose rounded-xl font-sans text-sm text-on-surface placeholder-outline border border-transparent focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <p className="font-sans text-xs text-outline mt-1">
          Lien Wave spécifique à ce produit (montant pré-rempli).
        </p>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        {([
          { key: 'isActive', label: 'Produit actif' },
          { key: 'isNew',    label: 'Badge "NOUVEAU"' },
        ] as const).map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" name={key}
              checked={form[key] as boolean}
              onChange={handleChange}
              className="sr-only"
            />
            <div className={`w-10 h-6 rounded-full transition-colors ${form[key] ? 'bg-primary' : 'bg-outline-variant'}`}>
              <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${form[key] ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <span className="font-sans text-sm text-on-surface">{label}</span>
          </label>
        ))}
      </div>

      {error   && <p className="font-sans text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
      {success && <p className="font-sans text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2">{success}</p>}

      <Button variant="primary" size="lg" fullWidth onClick={handleSubmit} disabled={saving}>
        {saving ? (
          <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" />Enregistrement...</span>
        ) : isEdit ? 'Mettre à jour' : 'Enregistrer le produit'}
      </Button>

      {/* Suppression */}
      {isEdit && (
        <div className="border-t border-outline-variant/20 pt-4">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 font-sans text-sm text-red-500 hover:text-red-700 transition-colors mx-auto"
            >
              <Trash2 size={15} strokeWidth={1.5} /> Supprimer ce produit
            </button>
          ) : (
            <div className="bg-red-50 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle size={16} strokeWidth={2} />
                <p className="font-sans text-sm font-semibold">Confirmer la suppression ?</p>
              </div>
              <p className="font-sans text-xs text-red-500">Cette action est irréversible.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-xl border border-red-200 py-2 font-sans text-sm text-red-500 hover:bg-red-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-red-500 text-white py-2 font-sans text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? <><Loader2 size={14} className="animate-spin" /> Suppression...</> : 'Oui, supprimer'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
