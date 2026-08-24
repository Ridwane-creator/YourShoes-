import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      toast.error("Connexion impossible : vérifie l'email et le mot de passe.")
      return
    }
    toast.success('Connecté !')
    navigate('/compte')
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-concrete hover:text-ink transition-colors mb-8"
      >
        <ChevronLeft size={15} />
        Retour à l'accueil
      </Link>

      <p className="font-mono text-xs tracking-widest text-volt mb-2 text-center">CONNEXION</p>
      <h1 className="font-display text-3xl text-center mb-8">MON COMPTE</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white border border-ink/10 rounded-2xl p-7">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-volt"
            placeholder="toi@exemple.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ink/15 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-volt"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 bg-volt hover:bg-volt-dark text-white font-semibold text-sm py-3 rounded-full transition-colors disabled:opacity-60"
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="text-center text-sm text-concrete mt-5">
        Pas encore de compte ?{' '}
        <Link to="/inscription" className="text-volt font-semibold underline underline-offset-4">
          Inscris-toi
        </Link>
      </p>
    </div>
  )
}
