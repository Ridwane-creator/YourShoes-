import { Phone, MapPin } from 'lucide-react'

export default function Topbar() {
  return (
    <div className="bg-ink text-bone text-xs font-body">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-9 flex items-center justify-between gap-4">
        <a
          href="tel:+22900000000"
          className="flex items-center gap-1.5 hover:text-tag transition-colors shrink-0"
        >
          <Phone size={13} strokeWidth={2.5} />
          <span className="tracking-wide">+229 00 00 00 00</span>
        </a>

        <div className="hidden sm:block flex-1 max-w-md overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee font-mono tracking-wide text-tag">
            <span className="px-6">LIVRAISON OFFERTE DÈS 50 000 FCFA</span>
            <span className="px-6">LIVRAISON OFFERTE DÈS 50 000 FCFA</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-concrete-light shrink-0">
          <MapPin size={13} strokeWidth={2.5} />
          <span className="tracking-wide">Cotonou, Bénin</span>
        </div>
      </div>
    </div>
  )
}
