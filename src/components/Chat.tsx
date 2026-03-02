'use client'
import { useState, useRef, useEffect } from 'react'

interface Message { role: 'user' | 'aria'; text: string }
interface HistoryItem { role: string; content: string }

export default function Chat({ kbUuid, businessName }: { kbUuid: string; businessName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'aria', text: `Hi! I'm ARIA, the virtual receptionist for ${businessName}. How can I help you today?` }
  ])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history, businessName }),
      })
      const data = await res.json()
      setHistory(data.history || [...history, { role: 'user', content: userMsg }, { role: 'assistant', content: data.reply }])
      setMessages(m => [...m, { role: 'aria', text: data.reply || 'Sorry, something went wrong.' }])
    } catch {
      setMessages(m => [...m, { role: 'aria', text: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#0a0f1e' }}>
      <div style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'16px 24px', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#6c63ff,#00d9ff)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16, color:'#fff' }}>A</div>
        <div>
          <div style={{ fontWeight:600, fontSize:14, color:'#fff' }}>ARIA</div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>{businessName} · AI Receptionist</div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80' }} />
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>Online</span>
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'24px', display:'flex', flexDirection:'column', gap:16, maxWidth:640, width:'100%', margin:'0 auto' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth:'75%', borderRadius:16, padding:'12px 16px', fontSize:14, lineHeight:1.6, borderBottomRightRadius: m.role==='user' ? 4 : 16, borderBottomLeftRadius: m.role==='aria' ? 4 : 16, background: m.role==='user' ? 'linear-gradient(135deg,#6c63ff,#4f46e5)' : 'rgba(255,255,255,0.05)', border: m.role==='aria' ? '1px solid rgba(255,255,255,0.08)' : 'none', color: m.role==='user' ? '#fff' : 'rgba(255,255,255,0.8)' }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:'flex', justifyContent:'flex-start' }}>
            <div style={{ borderRadius:16, borderBottomLeftRadius:4, padding:'12px 16px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', gap:4, alignItems:'center' }}>
              {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'rgba(255,255,255,0.3)' }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'16px 24px' }}>
        <form onSubmit={send} style={{ maxWidth:640, margin:'0 auto', display:'flex', gap:12 }}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask ARIA anything..."
            style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 16px', color:'#fff', fontSize:14, outline:'none' }} />
          <button type="submit" disabled={loading || !input.trim()}
            style={{ padding:'12px 20px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#6c63ff,#00d9ff)', color:'#fff', fontWeight:600, fontSize:14, cursor:'pointer', opacity: (loading||!input.trim()) ? 0.4 : 1 }}>
            Send
          </button>
        </form>
        <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.15)', marginTop:12 }}>Powered by DigitalOcean Gradient™ · FieldMatrix.ai</p>
      </div>
    </div>
  )
}
