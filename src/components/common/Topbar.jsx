import { Phone, MapPin } from 'lucide-react'

export default function Topbar() {
  return (
    <div className="bg-ink text-bone text-xs font-body">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-9 flex items-center justify-between">
        <a href="tel:+22900000000" className="flex items-center gap-1.5 hover:text-tag transition-colors">
          <Phone size={13} strokeWidth={2.5} />
          <span className="tracking-wide">+229 00 00 00 00</span>
        </a>
        <p className="hidden sm:block font-mono tracking-wide text-tag">
          LIVRAISON OFFERTE DÈS 50 000 FCFA
        </p>
        <div className="flex items-center gap-1.5 text-concrete-light">
          <MapPin size={13} strokeWidth={2.5} />
          <span className="tracking-wide">Cotonou, Bénin</span>
        </div>
      </div>
    </div>
  )
}
