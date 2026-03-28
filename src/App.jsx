import { Outlet } from 'react-router-dom'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading: session === undefined }}>
      <Navbar />
      <Outlet />
      <Footer />
    </AuthContext.Provider>
  )
}
