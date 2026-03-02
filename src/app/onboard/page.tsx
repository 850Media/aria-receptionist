'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function OnboardContent() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const [step, setStep] = useState<'form' | 'training' | 'done'>('form')
  const [form, setForm] = useState({ url: '', businessName: '' })
  const [result, setResult] = useState<{ chatUrl: string; businessName: string }>()
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleOnboard(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setStep('training')
    try {
      const res = await fetch('/api/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sessionId }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult({ chatUrl: data.chatUrl, businessName: data.businessName })
      setStep('done')
    } catch (err: any) {
      setError(err.message)
      setStep('form')
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

  const s = {
    input: { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'12px 16px', color:'#fff', fontSize:15, outline:'none', boxSizing:'border-box' as const },
    label: { display:'block', fontSize:11, letterSpacing:4, color:'rgba(255,255,255,0.3)', textTransform:'uppercase' as const, marginBottom:8 },
    btn: { padding:'14px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#6c63ff,#00d9ff)', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer', width:'100%' },
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', background:'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(108,99,255,0.08) 0%, transparent 60%), #0a0f1e' }}>
      <div style={{ textAlign:'center', marginBottom:32 }}>
        <div style={{ fontFamily:'Georgia,serif', fontSize:56, letterSpacing:8, lineHeight:1 }}>
          <span style={{ color:'#6c63ff' }}>A</span><span style={{ color:'#fff' }}>RI</span><span style={{ color:'#6c63ff' }}>A</span>
        </div>
        {step === 'form' && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.3)', borderRadius:100, padding:'6px 16px', marginTop:16 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80' }} />
            <span style={{ fontSize:13, color:'#4ade80' }}>Payment confirmed — let's set up your ARIA</span>
          </div>
        )}
      </div>

      {step === 'form' && (
        <form onSubmit={handleOnboard} style={{ width:'100%', maxWidth:420, display:'flex', flexDirection:'column', gap:16 }}>
          <div><label style={s.label}>Business Name</label>
            <input type="text" required placeholder="e.g. DontBugMe Pest Control" value={form.businessName}
              onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} style={s.input} /></div>
          <div><label style={s.label}>Website URL</label>
            <input type="url" required placeholder="https://yourbusiness.com" value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))} style={s.input} /></div>
          {error && <p style={{ color:'#ff6b6b', fontSize:14 }}>{error}</p>}
          <button type="submit" style={s.btn}>Train ARIA on My Website →</button>
        </form>
      )}

      {step === 'training' && (
        <div style={{ textAlign:'center' }}>
          <div style={{ display:'flex', justifyContent:'center', gap:6, alignItems:'flex-end', height:48, marginBottom:20 }}>
            {bars.map((h, i) => <div key={i} style={{ width:8, borderRadius:4, height:`${h}%`, background:'linear-gradient(to top,#6c63ff,#00d9ff)' }} />)}
          </div>
          <p style={{ color:'rgba(255,255,255,0.6)' }}>Training ARIA on <strong style={{ color:'#fff' }}>{form.businessName}</strong>...</p>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, marginTop:8 }}>Building your dedicated agent on DigitalOcean Gradient™</p>
        </div>
      )}

      {step === 'done' && result && (
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

          <a href={result.chatUrl} target="_blank" rel="noreferrer" style={{ display:'block', padding:'13px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#6c63ff,#00d9ff)', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', textAlign:'center', textDecoration:'none' }}>
            Open ARIA →
          </a>
          <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.15)', marginTop:16 }}>Powered by DigitalOcean Gradient™ · FieldMatrix.ai</p>
        </div>
      )}
    </div>
  )
}

export default function OnboardPage() {
  return <Suspense><OnboardContent /></Suspense>
}
