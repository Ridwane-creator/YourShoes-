import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './hooks/useAuth'
import AppRouter from './routes/AppRouter'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="bottom-center" />
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
