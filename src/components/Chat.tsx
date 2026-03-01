'use client'
import { useState, useRef, useEffect } from 'react'

interface Message { role: 'user' | 'aria'; text: string }

export default function Chat({ agentUuid, businessName }: { agentUuid: string; businessName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'aria', text: `Hi! I'm ARIA, the virtual receptionist for ${businessName}. How can I help you today?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [convUuid, setConvUuid] = useState<string | undefined>()
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
        body: JSON.stringify({ agentUuid, message: userMsg, conversationUuid: convUuid }),
      })
      const data = await res.json()
      if (data.conversationUuid) setConvUuid(data.conversationUuid)
      setMessages(m => [...m, { role: 'aria', text: data.reply || data.error || 'Sorry, something went wrong.' }])
    } catch {
      setMessages(m => [...m, { role: 'aria', text: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'radial-gradient(ellipse 60% 40% at 50% 0%, #6c63ff08 0%, transparent 60%), #0a0f1e'
    }}>
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #00d9ff)' }}>A</div>
        <div>
          <div className="font-semibold text-sm text-white">ARIA</div>
          <div className="text-xs text-white/30">{businessName} · AI Receptionist</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/30">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 max-w-2xl w-full mx-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'text-white rounded-br-sm'
                : 'text-white/80 border border-white/8 rounded-bl-sm'
            }`} style={m.role === 'user'
              ? { background: 'linear-gradient(135deg, #6c63ff, #4f46e5)' }
              : { background: 'rgba(255,255,255,0.04)' }
            }>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm px-4 py-3 border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="flex gap-1 items-center h-4">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/5 px-6 py-4">
        <form onSubmit={send} className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask ARIA anything..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/40 text-sm transition"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl text-white font-medium text-sm disabled:opacity-30 transition"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #00d9ff)' }}
          >
            Send
          </button>
        </form>
        <p className="text-center text-xs text-white/15 mt-3">Powered by DigitalOcean Gradient™ · FieldMatrix.ai</p>
      </div>
    </div>
  )
}
