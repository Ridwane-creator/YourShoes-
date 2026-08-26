// Supabase Edge Function : envoie un email au vendeur (et à l'acheteur si fourni)
// à chaque nouvelle commande.
// Déclenchée automatiquement par un Database Webhook sur INSERT dans la table `orders`.

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const VENDOR_EMAIL = Deno.env.get('VENDOR_EMAIL')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const PAYMENT_LABELS: Record<string, string> = {
  mtn: 'MTN Mobile Money',
  moov: 'Moov Money',
  cash_on_delivery: 'Paiement à la livraison',
}

function formatOrderNumber(id: string) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

async function fetchOrderItems(orderId: string, attempt = 1): Promise<any[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${orderId}&select=*`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  )
  const items = await res.json()

  // Les lignes de commande sont insérées juste après la commande elle-même :
  // si elles n'existent pas encore (course de vitesse), on retente une fois après 2s.
  if ((!items || items.length === 0) && attempt < 3) {
    await new Promise((r) => setTimeout(r, 2000))
    return fetchOrderItems(orderId, attempt + 1)
  }
  return items ?? []
}

function buildItemsHtml(items: any[]) {
  return items
    .map(
      (item: any) =>
        `<li>${item.product_name} (${item.size}${item.color ? ' · ' + item.color : ''}) × ${item.quantity} — ${(item.unit_price * item.quantity).toLocaleString('fr-FR')} FCFA</li>`
    )
    .join('')
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'SneakStore <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error(`Échec envoi email à ${to} :`, err)
  }
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const order = payload.record // ligne insérée dans `orders`

    const items = await fetchOrderItems(order.id)
    const itemsHtml = buildItemsHtml(items)
    const orderNumber = formatOrderNumber(order.id)
    const total = Number(order.total).toLocaleString('fr-FR')

    // Email au vendeur (toujours envoyé)
    const vendorHtml = `
      <h2>Nouvelle commande n° ${orderNumber}</h2>
      <p style="font-size:16px"><strong>Client : ${order.buyer_name}</strong></p>
      <p>Téléphone : ${order.buyer_phone}</p>
      <p>${order.delivery_address}, ${order.delivery_city}</p>
      <p>Paiement : ${PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</p>
      <ul>${itemsHtml}</ul>
      <p><strong>Total : ${total} FCFA</strong></p>
    `
    if (VENDOR_EMAIL) {
      await sendEmail(
        VENDOR_EMAIL,
        `Nouvelle commande de ${order.buyer_name} — n° ${orderNumber} — ${total} FCFA`,
        vendorHtml
      )
    }

    // Email de confirmation à l'acheteur, uniquement s'il a renseigné son email
    if (order.buyer_email) {
      const buyerHtml = `
        <h2>Merci pour ta commande, ${order.buyer_name} !</h2>
        <p>Commande n° ${orderNumber} confirmée.</p>
        <ul>${itemsHtml}</ul>
        <p><strong>Total : ${total} FCFA</strong></p>
        <p>Livraison : ${order.delivery_address}, ${order.delivery_city}</p>
        <p>Paiement : ${PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</p>
        <p>Tu seras contacté au ${order.buyer_phone} pour la livraison.</p>
      `
      await sendEmail(order.buyer_email, `Commande confirmée — n° ${orderNumber}`, buyerHtml)
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
