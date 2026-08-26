import jsPDF from 'jspdf'

const PAYMENT_LABELS = {
  mtn: 'MTN Mobile Money',
  moov: 'Moov Money',
  cash_on_delivery: 'Paiement à la livraison',
}

function formatOrderNumber(id) {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase()
}

export function generateReceiptPdf(order, items) {
  const doc = new jsPDF()
  const orderNumber = formatOrderNumber(order.id)
  const date = new Date(order.created_at ?? Date.now()).toLocaleDateString('fr-FR')

  let y = 20

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('SneakStore', 14, y)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Reçu de commande', 14, y + 7)
  y += 20

  doc.setFontSize(10)
  doc.text(`Commande n° ${orderNumber}`, 14, y)
  doc.text(`Date : ${date}`, 140, y)
  y += 10

  doc.setDrawColor(200)
  doc.line(14, y, 196, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('Client', 14, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  doc.text(order.buyer_name ?? '', 14, y)
  y += 5
  doc.text(order.buyer_phone ?? '', 14, y)
  y += 5
  if (order.buyer_email) {
    doc.text(order.buyer_email, 14, y)
    y += 5
  }
  y += 3
  doc.text(`Livraison : ${order.delivery_address ?? ''}, ${order.delivery_city ?? ''}`, 14, y)
  y += 5
  doc.text(`Paiement : ${PAYMENT_LABELS[order.payment_method] ?? order.payment_method}`, 14, y)
  y += 12

  doc.line(14, y, 196, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text('Article', 14, y)
  doc.text('Qté', 130, y)
  doc.text('Total', 170, y)
  y += 6
  doc.setFont('helvetica', 'normal')

  items.forEach((item) => {
    const label = `${item.name}${item.size ? ` (${item.size}${item.color ? ' · ' + item.color : ''})` : ''}`
    doc.text(label, 14, y, { maxWidth: 110 })
    doc.text(String(item.quantity), 130, y)
    doc.text(`${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA`, 170, y)
    y += 7
  })

  y += 5
  doc.line(14, y, 196, y)
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(`Total : ${Number(order.total).toLocaleString('fr-FR')} FCFA`, 14, y)

  y += 20
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text('Merci pour ta commande sur SneakStore.', 14, y)

  doc.save(`recu-sneakstore-${orderNumber}.pdf`)
}
