'use client'
import { useState } from 'react'
import Chat from '../components/Chat'

type Step = 'land' | 'onboarding' | 'deploy' | 'chat'

export default function Home() {
  const [step, setStep] = useState<Step>('land')
  const [form, setForm] = useState({ url: '', businessName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ chatUrl: string; businessName: string; chatId: string; endpoint: string; apiKey: string }>()
  const [copied, setCopied] = useState<string | null>(null)

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
      setResult({ chatUrl: data.chatUrl, businessName: data.businessName, chatId: data.chatId, endpoint: '', apiKey: '' })
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

  if (step === 'chat' && result) {
    return (
      <iframe
        src={result.chatUrl}
        style={{ width:'100%', height:'100vh', border:'none' }}
        title="ARIA Chat"
      />
    )
  }

  const appUrl = 'https://aria-receptionist-n5zcp.ondigitalocean.app'
  const iframeCode = result ? `<iframe\n  src="${result.chatUrl}"\n  width="400"\n  height="600"\n  style="border:none;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.3);"\n  title="ARIA - AI Receptionist"\n></iframe>` : ''

  const bars = [40,70,90,60,100,75,50,85,65]

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', background:'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(108,99,255,0.08) 0%, transparent 60%), #0a0f1e' }}>
      <div style={{ marginBottom:8, textAlign:'center' }}>
        <div style={{ fontFamily:'Georgia,serif', fontSize:72, letterSpacing:8, lineHeight:1, userSelect:'none' }}>
          <span style={{ color:'#6c63ff' }}>A</span>
          <span style={{ color:'#fff' }}>RI</span>
          <span style={{ color:'#6c63ff' }}>A</span>
        </div>
        <p style={{ fontSize:11, letterSpacing:6, color:'rgba(255,255,255,0.2)', textTransform:'uppercase', marginTop:4 }}>AI Receptionist · Always On</p>
      </div>

      {step === 'land' && (
        <>
          <p style={{ color:'rgba(255,255,255,0.5)', textAlign:'center', marginBottom:40, maxWidth:420, lineHeight:1.6 }}>
            Paste your website URL. ARIA learns your business in <strong style={{ color:'rgba(255,255,255,0.8)' }}>60 seconds</strong> and handles every customer inquiry 24/7.
          </p>
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
        </>
      )}

      {step === 'onboarding' && (
        <div style={{ textAlign:'center' }}>
          <div style={{ display:'flex', justifyContent:'center', gap:6, alignItems:'flex-end', height:48, marginBottom:16 }}>
            {bars.map((h, i) => (
              <div key={i} style={{ width:8, borderRadius:4, height:`${h}%`, background:'linear-gradient(to top,#6c63ff,#00d9ff)', opacity:0.85 }} />
            ))}
          </div>
          <p style={{ color:'rgba(255,255,255,0.6)' }}>ARIA is learning <strong style={{ color:'#fff' }}>{form.businessName}</strong>...</p>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:14, marginTop:8 }}>Building your dedicated AI agent on DigitalOcean Gradient™</p>
        </div>
      )}

      {step === 'deploy' && result && (
        <div style={{ width:'100%', maxWidth:560 }}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)', borderRadius:100, padding:'6px 16px', marginBottom:16 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80' }} />
              <span style={{ fontSize:13, color:'#4ade80' }}>ARIA is live for {result.businessName}</span>
            </div>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Your dedicated AI receptionist is ready. Deploy it anywhere in seconds.</p>
          </div>

          {/* Option 1: Direct Link */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:20, marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div>
                <p style={{ fontWeight:600, fontSize:14, color:'#fff', margin:0 }}>🔗 Direct Link</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', margin:'4px 0 0' }}>Share this URL — anyone can chat with ARIA</p>
              </div>
              <button onClick={() => copy(result.chatUrl, 'link')}
                style={{ padding:'6px 14px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color: copied==='link' ? '#4ade80' : 'rgba(255,255,255,0.6)', fontSize:12, cursor:'pointer' }}>
                {copied === 'link' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:12, color:'rgba(255,255,255,0.5)', wordBreak:'break-all' }}>
              {result.chatUrl}
            </div>
          </div>

          {/* Option 2: Embed */}
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:20, marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div>
                <p style={{ fontWeight:600, fontSize:14, color:'#fff', margin:0 }}>{'</>'} Embed on Your Website</p>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', margin:'4px 0 0' }}>Paste this snippet into any webpage</p>
              </div>
              <button onClick={() => copy(iframeCode, 'embed')}
                style={{ padding:'6px 14px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color: copied==='embed' ? '#4ade80' : 'rgba(255,255,255,0.6)', fontSize:12, cursor:'pointer' }}>
                {copied === 'embed' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{ background:'rgba(0,0,0,0.3)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:'rgba(255,255,255,0.5)', whiteSpace:'pre-wrap', wordBreak:'break-all', margin:0 }}>
              {iframeCode}
            </pre>
          </div>

          {/* CTA buttons */}
          <div style={{ display:'flex', gap:12 }}>
            <a href={result.chatUrl} target="_blank" rel="noreferrer"
              style={{ flex:1, padding:'13px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#6c63ff,#00d9ff)', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', textAlign:'center', textDecoration:'none' }}>
              Open ARIA →
            </a>
            <button onClick={() => { setStep('land'); setForm({ url:'', businessName:'' }); setResult(undefined) }}
              style={{ flex:1, padding:'13px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:14, cursor:'pointer' }}>
              Train Another Business
            </button>
          </div>
          <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.15)', marginTop:16 }}>Powered by DigitalOcean Gradient™ · FieldMatrix.ai</p>
        </div>
      )}
    </div>
  )
}
