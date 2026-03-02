'use client'
import { useState } from 'react'

type Step = 'land' | 'pricing' | 'onboarding' | 'deploy'

export default function Home() {
  const [step, setStep] = useState<Step>('land')
  const [form, setForm] = useState({ url: '', businessName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ chatUrl: string; businessName: string }>()
  const [copied, setCopied] = useState<string | null>(null)

  async function handleCheckout(plan: string) {
    setLoading(true)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(false)
  }

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
      setResult({ chatUrl: data.chatUrl, businessName: data.businessName })
      setStep('deploy')
    } catch (err: any) {
      setError(err.message)
      setStep('land')
    } finally {
      setLoading(false)
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const appUrl = 'https://aria-receptionist-n5zcp.ondigitalocean.app'
  const iframeCode = result ? `<script src="${appUrl}/widget.js" data-agent="${result.chatUrl}"></script>` : ''

  const bars = [40,70,90,60,100,75,50,85,65]

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', background:'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(108,99,255,0.08) 0%, transparent 60%), #0a0f1e' },
    logo: { fontFamily:'Georgia,serif', fontSize:64, letterSpacing:8, lineHeight:1, userSelect:'none', marginBottom:4 },
    sub: { fontSize:11, letterSpacing:6, color:'rgba(255,255,255,0.2)', textTransform:'uppercase' as const, marginBottom:32, textAlign:'center' as const },
    input: { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'12px 16px', color:'#fff', fontSize:15, outline:'none', boxSizing:'border-box' as const },
    label: { display:'block', fontSize:11, letterSpacing:4, color:'rgba(255,255,255,0.3)', textTransform:'uppercase' as const, marginBottom:8 },
    btn: { padding:'14px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#6c63ff,#00d9ff)', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', width:'100%' },
    card: { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:28, flex:1 },
    cardPop: { background:'rgba(108,99,255,0.08)', border:'1px solid rgba(108,99,255,0.4)', borderRadius:16, padding:28, flex:1, position:'relative' as const },
  }

  return (
    <div style={s.page}>
      <div style={{ textAlign:'center', marginBottom: step==='land' ? 8 : 24 }}>
        <div style={s.logo}>
          <span style={{ color:'#6c63ff' }}>A</span>
          <span style={{ color:'#fff' }}>RI</span>
          <span style={{ color:'#6c63ff' }}>A</span>
        </div>
        <p style={s.sub}>AI Receptionist · Always On</p>
      </div>

      {/* LANDING */}
      {step === 'land' && (
        <>
          <p style={{ color:'rgba(255,255,255,0.5)', textAlign:'center', marginBottom:48, maxWidth:460, lineHeight:1.7 }}>
            Turn your website into a 24/7 AI sales rep. ARIA learns your business in <strong style={{ color:'#fff' }}>60 seconds</strong> and handles every customer inquiry automatically.
          </p>
          <div style={{ display:'flex', gap:16, width:'100%', maxWidth:640, marginBottom:32, flexWrap:'wrap' as const }}>
            {/* Starter */}
            <div style={s.card}>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:8 }}>STARTER</p>
              <p style={{ fontSize:36, fontWeight:700, color:'#fff', margin:'0 0 4px' }}>$29<span style={{ fontSize:16, fontWeight:400, color:'rgba(255,255,255,0.4)' }}>/mo</span></p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.3)', marginBottom:20 }}>1 AI agent · 1,000 chats/mo</p>
              {['Dedicated AI receptionist', 'Embeddable chat widget', 'Lead capture', 'DigitalOcean Gradient™'].map(f => (
                <p key={f} style={{ fontSize:13, color:'rgba(255,255,255,0.6)', margin:'6px 0', display:'flex', gap:8 }}>
                  <span style={{ color:'#6c63ff' }}>✓</span> {f}
                </p>
              ))}
              <button onClick={() => handleCheckout('starter')} disabled={loading}
                style={{ ...s.btn, marginTop:24, background:'rgba(108,99,255,0.2)', border:'1px solid rgba(108,99,255,0.4)' }}>
                Get Started
              </button>
            </div>
            {/* Pro */}
            <div style={s.cardPop}>
              <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#6c63ff,#00d9ff)', borderRadius:100, padding:'4px 14px', fontSize:11, fontWeight:600, color:'#fff', whiteSpace:'nowrap' as const }}>MOST POPULAR</div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:8 }}>PRO</p>
              <p style={{ fontSize:36, fontWeight:700, color:'#fff', margin:'0 0 4px' }}>$99<span style={{ fontSize:16, fontWeight:400, color:'rgba(255,255,255,0.4)' }}>/mo</span></p>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.3)', marginBottom:20 }}>Unlimited agents · Unlimited chats</p>
              {['Everything in Starter', 'Unlimited AI agents', 'White-label branding', 'Priority support'].map(f => (
                <p key={f} style={{ fontSize:13, color:'rgba(255,255,255,0.6)', margin:'6px 0', display:'flex', gap:8 }}>
                  <span style={{ color:'#00d9ff' }}>✓</span> {f}
                </p>
              ))}
              <button onClick={() => handleCheckout('pro')} disabled={loading} style={{ ...s.btn, marginTop:24 }}>
                Go Pro
              </button>
            </div>
          </div>
          <button onClick={() => setStep('pricing')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:13, cursor:'pointer' }}>
            → Try free demo first
          </button>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.15)', marginTop:16 }}>Powered by DigitalOcean Gradient™</p>
        </>
      )}

      {/* FREE DEMO ONBOARD */}
      {step === 'pricing' && (
        <form onSubmit={handleOnboard} style={{ width:'100%', maxWidth:420, display:'flex', flexDirection:'column', gap:16 }}>
          <p style={{ color:'rgba(255,255,255,0.4)', textAlign:'center', fontSize:14, marginBottom:8 }}>Try ARIA free — no credit card required</p>
          <div><label style={s.label}>Business Name</label>
            <input type="text" required placeholder="e.g. DontBugMe Pest Control" value={form.businessName}
              onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} style={s.input} /></div>
          <div><label style={s.label}>Website URL</label>
            <input type="url" required placeholder="https://yourbusiness.com" value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))} style={s.input} /></div>
          {error && <p style={{ color:'#ff6b6b', fontSize:14 }}>{error}</p>}
          <button type="submit" style={s.btn}>Train ARIA on My Website →</button>
          <button type="button" onClick={() => setStep('land')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:13, cursor:'pointer' }}>← Back to pricing</button>
        </form>
      )}

      {/* TRAINING */}
      {step === 'onboarding' && (
        <div style={{ textAlign:'center' }}>
          <div style={{ display:'flex', justifyContent:'center', gap:6, alignItems:'flex-end', height:48, marginBottom:20 }}>
            {bars.map((h, i) => <div key={i} style={{ width:8, borderRadius:4, height:`${h}%`, background:'linear-gradient(to top,#6c63ff,#00d9ff)' }} />)}
          </div>
          <p style={{ color:'rgba(255,255,255,0.6)' }}>Training ARIA on <strong style={{ color:'#fff' }}>{form.businessName}</strong>...</p>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, marginTop:8 }}>Building your dedicated agent on DigitalOcean Gradient™</p>
        </div>
      )}

      {/* DEPLOY */}
      {step === 'deploy' && result && (
        <div style={{ width:'100%', maxWidth:560 }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)', borderRadius:100, padding:'6px 16px', marginBottom:12 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80' }} />
              <span style={{ fontSize:13, color:'#4ade80' }}>ARIA is live for {result.businessName}</span>
            </div>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Deploy to your website in seconds.</p>
          </div>

          {[
            { key:'link', label:'🔗 Direct Link', desc:'Share with anyone — no setup needed', value: result.chatUrl },
            { key:'embed', label:'</> Embed Widget', desc:'One line of code on your website', value: iframeCode },
          ].map(({ key, label, desc, value }) => (
            <div key={key} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:20, marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div>
                  <p style={{ fontWeight:600, fontSize:14, color:'#fff', margin:0 }}>{label}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', margin:'4px 0 0' }}>{desc}</p>
                </div>
                <button onClick={() => copy(value, key)} style={{ padding:'6px 14px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color: copied===key ? '#4ade80' : 'rgba(255,255,255,0.6)', fontSize:12, cursor:'pointer' }}>
                  {copied === key ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <pre style={{ background:'rgba(0,0,0,0.3)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.5)', whiteSpace:'pre-wrap', wordBreak:'break-all' as const, margin:0 }}>{value}</pre>
            </div>
          ))}

          <div style={{ display:'flex', gap:12, marginBottom:16 }}>
            <a href={result.chatUrl} target="_blank" rel="noreferrer" style={{ flex:1, padding:'13px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#6c63ff,#00d9ff)', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', textAlign:'center', textDecoration:'none' }}>
              Open ARIA →
            </a>
            <button onClick={() => handleCheckout('starter')} style={{ flex:1, padding:'13px', borderRadius:8, border:'1px solid rgba(108,99,255,0.4)', background:'rgba(108,99,255,0.1)', color:'#fff', fontSize:14, cursor:'pointer', fontWeight:600 }}>
              Upgrade to Keep It →
            </button>
          </div>
          <button onClick={() => { setStep('land'); setForm({ url:'', businessName:'' }); setResult(undefined) }} style={{ width:'100%', background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:13, cursor:'pointer' }}>
            Train another business
          </button>
          <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.15)', marginTop:16 }}>Powered by DigitalOcean Gradient™ · FieldMatrix.ai</p>
        </div>
      )}
    </div>
  )
}
