'use client'

import { useState, useEffect, useRef } from 'react'
import {
  User, Phone, MapPin, Package, ChevronRight,
  MessageCircle, Edit2, Check, X, ShoppingBag,
  Clock, Truck, Ban, Star
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/formatPrice'
import { WHATSAPP_NUMBER } from '@/lib/whatsapp'
import type { Order } from '@/lib/supabase/types'
import Link from 'next/link'

/* ── Profile stored in localStorage ─────────────────────────── */
interface Profile {
  name: string
  phone: string
  address: string
}

function loadProfile(): Profile {
  if (typeof window === 'undefined') return { name: '', phone: '', address: '' }
  try {
    const raw = localStorage.getItem('mlk-profile')
    return raw ? JSON.parse(raw) : { name: '', phone: '', address: '' }
  } catch {
    return { name: '', phone: '', address: '' }
  }
}

function saveProfile(p: Profile) {
  localStorage.setItem('mlk-profile', JSON.stringify(p))
}

/* ── Order status helpers ────────────────────────────────────── */
const STATUS_CONFIG = {
  nouvelle:  { label: 'En attente',  color: 'bg-amber-100 text-amber-700',  icon: Clock },
  confirmée: { label: 'Confirmée',   color: 'bg-blue-100 text-blue-700',    icon: Check },
  livrée:    { label: 'Livrée',      color: 'bg-green-100 text-green-700',  icon: Truck },
  annulée:   { label: 'Annulée',     color: 'bg-red-100 text-red-700',      icon: Ban },
} as const

/* ── Main page ───────────────────────────────────────────────── */
export default function ComptePage() {
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<Profile>({ name: '', phone: '', address: '' })
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Profile>({ name: '', phone: '', address: '' })

  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersSearched, setOrdersSearched] = useState(false)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    const p = loadProfile()
    setProfile(p)
    setDraft(p)
    setMounted(true)
  }, [])

  function startEdit() {
    setDraft({ ...profile })
    setEditing(true)
  }

  function cancelEdit() {
    setDraft({ ...profile })
    setEditing(false)
  }

  function confirmEdit() {
    saveProfile(draft)
    setProfile(draft)
    setEditing(false)
    // Auto-search orders if phone is set
    if (draft.phone.trim()) fetchOrders(draft.phone.trim())
  }

  async function fetchOrders(phone: string) {
    if (!phone) return
    setOrdersLoading(true)
    setOrdersSearched(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false })
    setOrders((data as Order[]) || [])
    setOrdersLoading(false)
  }

  // Auto-fetch orders on mount if profile has phone
  useEffect(() => {
    if (mounted && profile.phone.trim()) {
      fetchOrders(profile.phone.trim())
    }
  }, [mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  const initials = profile.name
    ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : null

  if (!mounted) return null

  return (
    <div className="bg-surface min-h-screen pb-8">

      {/* ── Avatar + name header ── */}
      <div className="bg-gradient-to-b from-primary/8 to-surface pt-8 pb-6 px-6 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/20 flex items-center justify-center">
          {initials ? (
            <span className="font-display italic text-primary text-2xl">{initials}</span>
          ) : (
            <User size={32} className="text-primary/50" strokeWidth={1.5} />
          )}
        </div>
        <div className="text-center">
          <p className="font-serif text-xl text-on-surface">
            {profile.name || 'Invitée'}
          </p>
          {profile.phone && (
            <p className="font-sans text-sm text-on-surface-variant mt-0.5">{profile.phone}</p>
          )}
        </div>
      </div>

      <div className="px-4 space-y-4 mt-4">

        {/* ── Mon profil ── */}
        <section className="bg-white rounded-2xl shadow-brand overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
            <h2 className="font-sans font-semibold text-on-surface text-sm uppercase tracking-wider">
              Mon profil
            </h2>
            {!editing ? (
              <button
                onClick={startEdit}
                className="flex items-center gap-1.5 text-primary font-sans text-sm font-medium hover:opacity-75 transition-opacity"
              >
                <Edit2 size={14} /> Modifier
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={cancelEdit} className="text-outline hover:text-on-surface transition-colors">
                  <X size={18} />
                </button>
                <button onClick={confirmEdit} className="text-primary hover:opacity-75 transition-opacity">
                  <Check size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="divide-y divide-outline-variant/15">
            <ProfileField
              icon={<User size={16} className="text-on-surface-variant" strokeWidth={1.5} />}
              label="Prénom & Nom"
              value={editing ? draft.name : profile.name}
              placeholder="Marie Koné"
              editing={editing}
              onChange={(v) => setDraft(d => ({ ...d, name: v }))}
            />
            <ProfileField
              icon={<Phone size={16} className="text-on-surface-variant" strokeWidth={1.5} />}
              label="Téléphone"
              value={editing ? draft.phone : profile.phone}
              placeholder="+225 07 00 00 00 00"
              editing={editing}
              inputMode="tel"
              onChange={(v) => setDraft(d => ({ ...d, phone: v }))}
            />
            <ProfileField
              icon={<MapPin size={16} className="text-on-surface-variant" strokeWidth={1.5} />}
              label="Adresse de livraison"
              value={editing ? draft.address : profile.address}
              placeholder="Cocody, Abidjan"
              editing={editing}
              onChange={(v) => setDraft(d => ({ ...d, address: v }))}
            />
          </div>

          {!profile.name && !editing && (
            <p className="px-5 py-3 font-sans text-xs text-on-surface-variant bg-surface-rose/50">
              Complétez votre profil pour accélérer vos commandes.
            </p>
          )}
        </section>

        {/* ── Mes commandes ── */}
        <section className="bg-white rounded-2xl shadow-brand overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
            <h2 className="font-sans font-semibold text-on-surface text-sm uppercase tracking-wider">
              Mes commandes
            </h2>
            {profile.phone && (
              <button
                onClick={() => fetchOrders(profile.phone)}
                className="font-sans text-xs text-primary font-medium hover:opacity-75 transition-opacity"
              >
                Actualiser
              </button>
            )}
          </div>

          {!profile.phone && !ordersSearched ? (
            <div className="px-5 py-8 flex flex-col items-center gap-3 text-center">
              <Package size={36} className="text-outline/40" strokeWidth={1} />
              <p className="font-sans text-sm text-on-surface-variant">
                Ajoutez votre numéro de téléphone pour retrouver vos commandes.
              </p>
            </div>
          ) : ordersLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2].map(i => (
                <div key={i} className="h-16 bg-surface-rose rounded-xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 && ordersSearched ? (
            <div className="px-5 py-8 flex flex-col items-center gap-3 text-center">
              <ShoppingBag size={36} className="text-outline/40" strokeWidth={1} />
              <p className="font-sans text-sm text-on-surface-variant">
                Aucune commande trouvée pour ce numéro.
              </p>
              <Link
                href="/boutique"
                className="font-sans text-sm text-primary font-medium underline underline-offset-2"
              >
                Découvrir la boutique
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/15">
              {orders.map(order => {
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.nouvelle
                const StatusIcon = cfg.icon
                const isExpanded = expandedOrder === order.id
                return (
                  <div key={order.id}>
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="w-full px-5 py-4 flex items-center gap-4 hover:bg-surface-rose/30 transition-colors text-left"
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color.replace('text-', 'text-').split(' ')[0]} bg-opacity-20`}
                        style={{ background: 'transparent' }}>
                        <StatusIcon size={16} className={cfg.color.split(' ')[1]} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-medium text-sm text-on-surface truncate">
                          Commande #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className="font-sans font-semibold text-sm text-primary">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`text-outline transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                        strokeWidth={1.5}
                      />
                    </button>

                    {/* Order detail */}
                    {isExpanded && (
                      <div className="bg-surface-rose/40 px-5 py-4 space-y-2 border-t border-outline-variant/15">
                        {(order.items as any[]).map((item, i) => (
                          <div key={i} className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-sans text-sm text-on-surface truncate">{item.name}</p>
                              <p className="font-sans text-xs text-on-surface-variant">
                                Taille {item.size} · Qté {item.qty}
                              </p>
                            </div>
                            <span className="font-sans text-sm font-medium text-on-surface flex-shrink-0">
                              {formatPrice(item.price * item.qty)}
                            </span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-outline-variant/20 flex justify-between">
                          <span className="font-sans text-sm font-semibold text-on-surface">Total</span>
                          <span className="font-sans text-sm font-bold text-primary">{formatPrice(order.total)}</span>
                        </div>
                        {order.customer_address && (
                          <p className="font-sans text-xs text-on-surface-variant pt-1">
                            📍 {order.customer_address}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Contact & liens utiles ── */}
        <section className="bg-white rounded-2xl shadow-brand overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/20">
            <h2 className="font-sans font-semibold text-on-surface text-sm uppercase tracking-wider">
              Nous contacter
            </h2>
          </div>
          <div className="divide-y divide-outline-variant/15">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent("Bonjour MLK-Boutique ! J'ai une question 👋")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-5 py-4 hover:bg-surface-rose/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={18} className="text-green-600" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="font-sans font-medium text-sm text-on-surface">WhatsApp</p>
                <p className="font-sans text-xs text-on-surface-variant">Réponse en moins d'1h</p>
              </div>
              <ChevronRight size={16} className="text-outline" strokeWidth={1.5} />
            </a>
            <Link
              href="/boutique"
              className="flex items-center gap-4 px-5 py-4 hover:bg-surface-rose/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                <ShoppingBag size={18} className="text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="font-sans font-medium text-sm text-on-surface">Découvrir la boutique</p>
                <p className="font-sans text-xs text-on-surface-variant">Nouvelle collection disponible</p>
              </div>
              <ChevronRight size={16} className="text-outline" strokeWidth={1.5} />
            </Link>
          </div>
        </section>

        {/* ── À propos ── */}
        <section className="bg-white rounded-2xl shadow-brand px-5 py-5">
          <div className="flex items-center gap-3 mb-3">
            <Star size={16} className="text-primary" strokeWidth={1.5} />
            <h2 className="font-sans font-semibold text-on-surface text-sm uppercase tracking-wider">
              MLK-Boutique
            </h2>
          </div>
          <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
            Votre boutique de mode féminine à Abidjan. Vêtements, bijoux, chaussures et beauté —
            l'élégance ivoirienne au quotidien.
          </p>
          <p className="font-sans text-xs text-outline mt-3">Abidjan, Côte d'Ivoire · {new Date().getFullYear()}</p>
        </section>

      </div>
    </div>
  )
}

/* ── ProfileField sub-component ─────────────────────────────── */
function ProfileField({
  icon, label, value, placeholder, editing, onChange, inputMode,
}: {
  icon: React.ReactNode
  label: string
  value: string
  placeholder: string
  editing: boolean
  onChange: (v: string) => void
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[10px] text-outline uppercase tracking-wider mb-0.5">{label}</p>
        {editing ? (
          <input
            type="text"
            inputMode={inputMode}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full font-sans text-sm text-on-surface bg-transparent border-b border-primary/40 focus:border-primary outline-none pb-0.5 placeholder:text-outline/50 transition-colors"
            autoComplete="off"
          />
        ) : (
          <p className={`font-sans text-sm ${value ? 'text-on-surface' : 'text-outline/50 italic'}`}>
            {value || placeholder}
          </p>
        )}
      </div>
    </div>
  )
}
