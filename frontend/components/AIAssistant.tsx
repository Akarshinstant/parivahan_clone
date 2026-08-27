'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X } from './Icons'

type Lang = 'en' | 'hi' | 'kn'
type Msg = { role: 'user' | 'assistant'; content: string }

const LANG_LABELS: Record<Lang, string> = {
  en: 'English',
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
}

const STARTERS: Record<Lang, string[]> = {
  en: ['Am I eligible?', 'What documents do I need?', 'What are the fees?', 'How long does it take?'],
  hi: ['क्या मैं पात्र हूं?', 'कौन से दस्तावेज़ चाहिए?', 'शुल्क कितना है?', 'कितना समय लगेगा?'],
  kn: ['ನಾನು ಅರ್ಹನೇ?', 'ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?', 'ಶುಲ್ಕ ಎಷ್ಟು?', 'ಎಷ್ಟು ಸಮಯ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ?'],
}

export function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState<Lang>('en')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [fallback, setFallback] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      bottomRef.current?.scrollIntoView()
    }
  }, [open, msgs])

  async function send(text?: string) {
    const msg = text || input
    if (!msg.trim()) return
    setInput('')
    setMsgs(m => [...m, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, language: lang }),
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'assistant', content: data.content || 'Sorry, I could not get a response.' }])
      if (data.usingFallback) setFallback(true)
    } catch {
      setFallback(true)
      setMsgs(m => [...m, { role: 'assistant', content: 'Connection issue. Please try again.' }])
    }
    setLoading(false)
  }

  function renderContent(text: string) {
    // Simple markdown: **bold**, \n newlines, numbered lists
    return text
      .split('\n')
      .map((line, i) => {
        const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        return <p key={i} className={`text-sm ${line.startsWith('#') ? 'font-bold' : ''}`} dangerouslySetInnerHTML={{ __html: bold }} />
      })
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-4 z-50 bg-gov-blue text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center hover:bg-blue-900 transition-all focus-visible:ring-2 focus-visible:ring-gov-orange"
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant — ask about eligibility, documents, fees'}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="RTO AI Assistant"
          className="fixed bottom-24 right-4 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ maxHeight: '70vh' }}
        >
          {/* Header */}
          <div className="bg-gov-blue text-white px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">RTO Assistant</div>
              {fallback && (
                <div className="text-xs text-blue-200 flex items-center gap-1">
                  ⚡ Offline/fallback mode
                </div>
              )}
              {!fallback && (
                <div className="text-xs text-blue-200">Powered by stealth/ox-alpha</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Language switcher */}
              <select
                value={lang}
                onChange={e => setLang(e.target.value as Lang)}
                className="bg-blue-900 text-white text-xs rounded px-1 py-1 border border-blue-700 focus:outline-none"
                aria-label="Select language"
              >
                {Object.entries(LANG_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <button onClick={() => setOpen(false)} className="text-blue-200 hover:text-white" aria-label="Close assistant">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {msgs.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 text-center">
                  Ask me about eligibility, documents, fees, or the application process.
                  <br />I cannot see your form data or make approval decisions.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {STARTERS[lang].map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-gov-blue hover:text-gov-blue transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 space-y-1 ${
                    m.role === 'user'
                      ? 'bg-gov-blue text-white rounded-br-sm text-sm'
                      : 'bg-white border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  {m.role === 'user' ? (
                    <p className="text-sm">{m.content}</p>
                  ) : (
                    <div className={`space-y-1 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                      {renderContent(m.content)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm text-gray-400">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={e => { e.preventDefault(); send() }}
            className="border-t border-gray-100 p-3 flex gap-2 bg-white"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={lang === 'hi' ? 'प्रश्न पूछें...' : lang === 'kn' ? 'ಪ್ರಶ್ನೆ ಕೇಳಿ...' : 'Ask a question...'}
              className={`flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-gov-blue focus:outline-none ${lang === 'hi' ? 'font-hindi' : ''}`}
              disabled={loading}
              aria-label="Message to assistant"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gov-blue text-white px-3 py-2 rounded-xl hover:bg-blue-900 transition-all disabled:opacity-50 text-sm font-medium"
              aria-label="Send message"
            >
              →
            </button>
          </form>

          <div className="text-center text-xs text-gray-400 pb-2">
            Text always available · Does not see your form data
          </div>
        </div>
      )}
    </>
  )
}
