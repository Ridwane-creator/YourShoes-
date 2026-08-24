import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

export default function AdminLogin() {
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
    navigate('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-display text-2xl text-bone tracking-tight">
            SNEAK<span className="text-volt">STORE</span>
          </span>
          <p className="font-mono text-[10px] tracking-widest text-tag mt-2">
            ESPACE VENDEUR
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-ink-soft rounded-2xl p-7 flex flex-col gap-4">
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-concrete-light mb-1.5">
              EMAIL
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2.5 text-bone text-sm outline-none focus:border-volt"
              placeholder="vendeur@sneakstore.com"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-concrete-light mb-1.5">
              MOT DE PASSE
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ink border border-white/10 rounded-lg px-4 py-2.5 text-bone text-sm outline-none focus:border-volt"
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
      </div>
    </div>
  )
}
