'use client'
import { useEffect, useState } from 'react'
import Chat from '../../../components/Chat'

export default function ChatPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<{ endpoint: string; apiKey: string; businessName: string } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/session/${params.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError('This ARIA session has expired or does not exist.')
        else setSession(d)
      })
      .catch(() => setError('Failed to load session.'))
  }, [params.id])

  if (error) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0f1e', color:'rgba(255,255,255,0.5)', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:48, opacity:0.3 }}>A</div>
      <p>{error}</p>
      <a href="/" style={{ color:'#6c63ff', fontSize:14 }}>Create a new ARIA →</a>
    </div>
  )

  if (!session) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0f1e', color:'rgba(255,255,255,0.3)' }}>
      Loading ARIA...
    </div>
  )

  return <Chat {...session} />
}
