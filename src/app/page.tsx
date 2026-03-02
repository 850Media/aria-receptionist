'use client'
import { useState } from 'react'
import Chat from '../components/Chat'

export default function Home() {
  const [step, setStep] = useState<'land' | 'onboarding' | 'ready'>('land')
  const [form, setForm] = useState({ url: '', businessName: '' })
  const [loading, setLoading] = useState(false)
  const [kbUuid, setKbUuid] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [error, setError] = useState('')

  async function handleOnboard(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setStep('onboarding')
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setKbUuid(data.kbUuid)
      setSystemPrompt(data.systemPrompt)
      await new Promise(r => setTimeout(r, 3000))
      setStep('ready')
    } catch (err: any) {
      setError(err.message)
      setStep('land')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'ready') return <Chat kbUuid={kbUuid} businessName={form.businessName} systemPrompt={systemPrompt} />

  const bars = [40,70,90,60,100,75,50,85,65]

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 24px', background:'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(108,99,255,0.08) 0%, transparent 60%), #0a0f1e' }}>
      <div style={{ marginBottom:8, textAlign:'center' }}>
        <div style={{ fontFamily:'Georgia,serif', fontSize:96, letterSpacing:8, lineHeight:1, userSelect:'none' }}>
          <span style={{ color:'#6c63ff' }}>A</span>
          <span style={{ color:'#fff' }}>RI</span>
          <span style={{ color:'#6c63ff' }}>A</span>
        </div>
        <p style={{ fontSize:11, letterSpacing:6, color:'rgba(255,255,255,0.2)', textTransform:'uppercase', marginTop:4 }}>AI Receptionist · Always On</p>
      </div>

      <p style={{ color:'rgba(255,255,255,0.5)', textAlign:'center', marginBottom:40, maxWidth:420, lineHeight:1.6 }}>
        Paste your website URL. ARIA learns your business in <strong style={{ color:'rgba(255,255,255,0.8)' }}>60 seconds</strong> and handles every customer inquiry 24/7.
      </p>

      {step === 'land' && (
        <form onSubmit={handleOnboard} style={{ width:'100%', maxWidth:420, display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ display:'block', fontSize:11, letterSpacing:4, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom:8 }}>Business Name</label>
            <input type="text" required placeholder="e.g. DontBugMe Pest Control" value={form.businessName}
              onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
              style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'12px 16px', color:'#fff', fontSize:15, outline:'none', boxSizing:'border-box' }} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:11, letterSpacing:4, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom:8 }}>Website URL</label>
            <input type="url" required placeholder="https://yourbusiness.com" value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'12px 16px', color:'#fff', fontSize:15, outline:'none', boxSizing:'border-box' }} />
          </div>
          {error && <p style={{ color:'#ff6b6b', fontSize:14 }}>{error}</p>}
          <button type="submit" style={{ padding:'14px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#6c63ff,#00d9ff)', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer' }}>
            Train ARIA on My Website →
          </button>
          <p style={{ textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.2)' }}>Powered by DigitalOcean Gradient™</p>
        </form>
      )}

      {step === 'onboarding' && (
        <div style={{ textAlign:'center' }}>
          <div style={{ display:'flex', justifyContent:'center', gap:6, alignItems:'flex-end', height:48, marginBottom:16 }}>
            {bars.map((h, i) => (
              <div key={i} style={{ width:8, borderRadius:4, height:`${h}%`, background:'linear-gradient(to top,#6c63ff,#00d9ff)', opacity:0.85 }} />
            ))}
          </div>
          <p style={{ color:'rgba(255,255,255,0.6)' }}>ARIA is learning <strong style={{ color:'#fff' }}>{form.businessName}</strong>...</p>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:14, marginTop:8 }}>Crawling website and building knowledge base</p>
        </div>
      )}
    </div>
  )
}
