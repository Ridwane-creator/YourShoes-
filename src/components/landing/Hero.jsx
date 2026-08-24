import { ArrowUpRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-bone">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-10 items-center py-16 lg:py-24">
        {/* Texte */}
        <div className="relative z-10 order-2 lg:order-1">
          <p className="font-mono text-xs tracking-[0.25em] text-tag mb-5">
            DROP N°SS26-014 — ÉDITION LIMITÉE
          </p>
          <h1 className="font-display text-[15vw] leading-[0.85] sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight mb-6">
            POSE
            <br />
            <span className="text-volt">LE PIED.</span>
          </h1>
          <p className="font-body text-concrete-light max-w-md mb-8 text-base leading-relaxed">
            Les baskets qui comptent, sélectionnées une par une. Nouveaux
            modèles chaque semaine, stock vérifié, livraison partout à Cotonou.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#catalogue"
              className="group inline-flex items-center gap-2 bg-volt hover:bg-volt-dark text-white font-semibold text-sm px-7 py-4 rounded-full transition-colors"
            >
              Voir le catalogue
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a href="#nouveautes" className="text-sm font-semibold underline underline-offset-4 decoration-concrete hover:decoration-tag hover:text-tag transition-colors">
              Dernières nouveautés
            </a>
          </div>
        </div>

        {/* Visuel + étiquette prix façon hangtag */}
        <div className="relative order-1 lg:order-2 aspect-[4/3] flex items-center justify-center">
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-volt/25 via-transparent to-tag/20" />
          <div className="relative w-full max-w-md aspect-square rounded-[2rem] border border-white/10 bg-ink-soft flex items-center justify-center">
            <span className="font-display text-bone/10 text-[10rem] leading-none select-none">S</span>
          </div>

          {/* Hangtag rotatif */}
          <div className="absolute -bottom-4 -left-2 sm:left-4 bg-tag text-ink rounded-2xl px-5 py-3 shadow-xl -rotate-6">
            <p className="font-mono text-[10px] tracking-widest uppercase mb-0.5">Dès</p>
            <p className="font-display text-2xl leading-none">25 000 FCFA</p>
          </div>
        </div>
      </div>

      <div className="perforation" />
    </section>
  )
}
