import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Smartphone, Wallet } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'

const checkoutSchema = z.object({
  buyer_name: z.string().min(2, 'Nom trop court'),
  buyer_phone: z.string().min(8, 'Numéro invalide'),
  buyer_email: z.string().email('Email invalide').optional().or(z.literal('')),
  delivery_address: z.string().min(5, 'Adresse trop courte'),
  delivery_city: z.string().min(2, 'Requis'),
  payment_method: z.enum(['mtn', 'moov', 'cash_on_delivery']),
})

const PAYMENT_METHODS = [
  { value: 'mtn', label: 'MTN Mobile Money', icon: Smartphone },
  { value: 'moov', label: 'Moov Money', icon: Smartphone },
  { value: 'cash_on_delivery', label: 'Paiement à la livraison', icon: Wallet },
]

export default function Checkout() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const clear = useCartStore((s) => s.clear)
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const { user, profile } = useAuth()

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      payment_method: 'cash_on_delivery',
      buyer_name: profile?.full_name ?? '',
      buyer_phone: profile?.phone ?? '',
      buyer_email: user?.email ?? '',
    },
  })

  useEffect(() => {
    if (profile) {
      reset((prev) => ({
        ...prev,
        buyer_name: profile.full_name ?? prev.buyer_name,
        buyer_phone: profile.phone ?? prev.buyer_phone,
        buyer_email: user?.email ?? prev.buyer_email,
      }))
    }
  }, [profile, user, reset])

  const paymentMethod = watch('payment_method')

  if (!items.length) {
    return (
      <div className="max-w-xl mx-auto px-4 md:px-8 py-24 text-center">
        <p className="font-display text-2xl mb-2">PANIER VIDE</p>
        <p className="font-body text-sm text-concrete mb-6">
          Ajoute une paire avant de passer commande.
        </p>
        <Link to="/" className="text-volt font-semibold text-sm underline underline-offset-4">
          Retour au catalogue
        </Link>
      </div>
    )
  }

  async function onSubmit(values) {
    setSubmitting(true)
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user?.id ?? null,
          buyer_name: values.buyer_name,
          buyer_phone: values.buyer_phone,
          buyer_email: values.buyer_email || null,
          delivery_address: values.delivery_address,
          delivery_city: values.delivery_city,
          payment_method: values.payment_method,
          total,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItemsPayload = items.map((item) => ({
        order_id: order.id,
        variant_id: item.variantId,
        product_name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unit_price: item.price,
      }))
      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsPayload)
      if (itemsError) throw itemsError

      // Décrémente le stock de chaque variante achetée
      await Promise.all(
        items.map((item) =>
          supabase.rpc('decrement_variant_stock', {
            p_variant_id: item.variantId,
            p_quantity: item.quantity,
          })
        )
      )

      clear()
      navigate('/commande-confirmee', {
        state: { order, items },
      })
    } catch (err) {
      toast.error(`Erreur lors de la commande : ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
      <p className="font-mono text-xs tracking-widest text-volt mb-2">CHECKOUT</p>
      <h1 className="font-display text-3xl sm:text-4xl mb-8">FINALISER LA COMMANDE</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-[1fr_320px] gap-8">
        <div className="flex flex-col gap-6">
          {/* Livraison */}
          <div className="bg-white border border-ink/10 rounded-2xl p-6">
            <p className="font-mono text-[10px] tracking-widest text-volt mb-4">LIVRAISON</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5">Nom complet</label>
                <input
                  {...register('buyer_name')}
                  placeholder="Ridwane Alao"
                  className="w-full border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-volt"
                />
                {errors.buyer_name && (
                  <p className="text-xs text-red-600 mt-1">{errors.buyer_name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Téléphone</label>
                <input
                  {...register('buyer_phone')}
                  placeholder="01 00 00 00 00"
                  className="w-full border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-volt"
                />
                {errors.buyer_phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.buyer_phone.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5">
                  Email (optionnel — pour recevoir la confirmation)
                </label>
                <input
                  type="email"
                  {...register('buyer_email')}
                  placeholder="toi@exemple.com"
                  className="w-full border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-volt"
                />
                {errors.buyer_email && (
                  <p className="text-xs text-red-600 mt-1">{errors.buyer_email.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5">Adresse (quartier, repère)</label>
                <input
                  {...register('delivery_address')}
                  placeholder="Cadjèhoun, non loin de la pharmacie..."
                  className="w-full border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-volt"
                />
                {errors.delivery_address && (
                  <p className="text-xs text-red-600 mt-1">{errors.delivery_address.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5">Ville</label>
                <input
                  {...register('delivery_city')}
                  placeholder="Cotonou"
                  className="w-full border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-volt"
                />
                {errors.delivery_city && (
                  <p className="text-xs text-red-600 mt-1">{errors.delivery_city.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div className="bg-white border border-ink/10 rounded-2xl p-6">
            <p className="font-mono text-[10px] tracking-widest text-volt mb-4">MODE DE PAIEMENT</p>
            <Controller
              control={control}
              name="payment_method"
              render={({ field }) => (
                <div className="flex flex-col gap-2.5">
                  {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                    <label
                      key={value}
                      className={`flex items-center gap-3 border rounded-xl px-4 py-3.5 cursor-pointer transition-colors ${
                        field.value === value ? 'border-ink bg-bone-dim' : 'border-ink/15'
                      }`}
                    >
                      <input
                        type="radio"
                        value={value}
                        checked={field.value === value}
                        onChange={() => field.onChange(value)}
                        className="accent-volt"
                      />
                      <Icon size={17} />
                      <span className="text-sm font-semibold">{label}</span>
                    </label>
                  ))}
                </div>
              )}
            />
            {(paymentMethod === 'mtn' || paymentMethod === 'moov') && (
              <p className="text-xs text-concrete mt-3">
                Tu seras contacté par téléphone pour finaliser le paiement Mobile Money.
              </p>
            )}
          </div>
        </div>

        {/* Récap */}
        <div className="bg-white border border-ink/10 rounded-2xl p-6 h-fit sticky top-24">
          <p className="font-mono text-[10px] tracking-widest text-volt mb-4">RÉCAPITULATIF</p>
          <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.variantId} className="flex justify-between text-xs">
                <span className="text-concrete truncate pr-2">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-semibold shrink-0">
                  {(item.price * item.quantity).toLocaleString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
          <div className="perforation mb-4" />
          <div className="flex justify-between mb-6">
            <span className="font-mono text-xs tracking-widest text-concrete">TOTAL</span>
            <span className="font-display text-xl">{total.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-volt hover:bg-volt-dark text-white font-semibold text-sm py-3.5 rounded-full transition-colors disabled:opacity-60"
          >
            {submitting ? 'Validation…' : 'Confirmer la commande'}
          </button>
        </div>
      </form>
    </div>
  )
}
