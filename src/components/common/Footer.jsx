export default function Footer() {
  return (
    <footer className="bg-ink text-concrete-light mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid sm:grid-cols-3 gap-10">
        <div>
          <p className="font-display text-2xl text-bone mb-3">
            SNEAK<span className="text-volt">STORE</span>
          </p>
          <p className="text-sm max-w-xs">
            Vente de baskets en ligne à Cotonou. Nouveaux modèles chaque
            semaine, stock vérifié.
          </p>
        </div>
        <div>
          <p className="font-mono text-xs tracking-widest text-tag mb-3">NAVIGATION</p>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-white transition-colors">Catalogue</a></li>
            <li><a href="/panier" className="hover:text-white transition-colors">Panier</a></li>
            <li><a href="/compte" className="hover:text-white transition-colors">Mon compte</a></li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs tracking-widest text-tag mb-3">CONTACT</p>
          <ul className="space-y-2 text-sm">
            <li>+229 00 00 00 00</li>
            <li>Cotonou, Bénin</li>
          </ul>
        </div>
      </div>
      <div className="perforation opacity-20" />
      <p className="text-center text-xs py-5 font-mono text-concrete">
        © {new Date().getFullYear()} SneakStore — Tous droits réservés
      </p>
    </footer>
  )
}
