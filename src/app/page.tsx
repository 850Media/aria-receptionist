'use client'
import { useState } from 'react'
import Chat from '@/components/Chat'

export default function Home() {
  const [step, setStep] = useState<'land' | 'onboarding' | 'ready'>('land')
  const [form, setForm] = useState({ url: '', businessName: '' })
  const [loading, setLoading] = useState(false)
  const [agentUuid, setAgentUuid] = useState('')
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
      setAgentUuid(data.agentUuid)
      // Wait 3s for indexing to start, then show chat
      await new Promise(r => setTimeout(r, 3000))
      setStep('ready')
    } catch (err: any) {
      setError(err.message)
      setStep('land')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'ready') {
    return <Chat agentUuid={agentUuid} businessName={form.businessName} />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{
      background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #6c63ff10 0%, transparent 60%), #0a0f1e'
    }}>
      {/* Logo */}
      <div className="mb-2 text-center">
        <div className="font-['Bebas_Neue'] text-8xl tracking-widest select-none">
          <span style={{ color: '#6c63ff' }}>A</span>
          <span className="text-white">RI</span>
          <span style={{ color: '#6c63ff' }}>A</span>
        </div>
        <p className="text-xs tracking-[6px] text-white/20 uppercase mt-1">AI Receptionist · Always On</p>
      </div>

      <p className="text-white/50 text-center mb-10 max-w-md leading-relaxed">
        Paste your website URL. ARIA learns your business in <span className="text-white/80 font-medium">60 seconds</span> and handles every customer inquiry 24/7.
      </p>

      {step === 'land' && (
        <form onSubmit={handleOnboard} className="w-full max-w-md space-y-4">
          <div>
            <label className="block text-xs tracking-widest text-white/30 uppercase mb-2">Business Name</label>
            <input
              type="text"
              required
              placeholder="e.g. DontBugMe Pest Control"
              value={form.businessName}
              onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition"
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest text-white/30 uppercase mb-2">Website URL</label>
            <input
              type="url"
              required
              placeholder="https://yourbusiness.com"
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 transition"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d9ff)' }}
          >
            Train ARIA on My Website →
          </button>
          <p className="text-center text-xs text-white/20">Powered by DigitalOcean Gradient™</p>
        </form>
      )}

      {step === 'onboarding' && (
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-1 items-end h-12">
            {[40,70,90,60,100,75,50,85,65].map((h, i) => (
              <div key={i} className="w-2 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  background: 'linear-gradient(to top, #6c63ff, #00d9ff)',
                  animationDelay: `${i * 100}ms`
                }} />
            ))}
          </div>
          <p className="text-white/60">ARIA is learning <span className="text-white font-medium">{form.businessName}</span>...</p>
          <p className="text-white/30 text-sm">Crawling your website and building knowledge base</p>
        </div>
      )}
    </div>
  )
}
