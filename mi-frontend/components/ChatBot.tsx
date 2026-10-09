'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export function ChatBot() {
  const [open, setOpen] = useState(false)

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '¡Hola! 👋 Soy el asistente de Cielo Viajes. ¿En qué puedo ayudarte hoy? ✈️',
    },
  ])

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMsg: Message = {
      role: 'user',
      content: input.trim(),
    }

    const updated = [...messages, userMsg]

    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: updated }),
      })

      const data = await res.json()

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Lo siento, hubo un error. Por favor intenta de nuevo.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      
      {/* CHAT */}
      {open && (
        <div
          className="w-[340px] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ height: '520px' }}
        >
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-sky-500 to-cyan-500 p-4 flex items-center justify-between">
            
            <div className="flex items-center gap-3">
              
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Bot size={20} className="text-white" />
              </div>

              <div>
                <p className="text-white font-bold text-sm">
                  Asistente Cielo
                </p>

                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />

                  <p className="text-white/80 text-xs">
                    En línea
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 transition-all flex items-center justify-center"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* MENSAJES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1 shadow-md">
                    <Bot size={15} className="text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-sky-500 to-cyan-500 text-white rounded-br-md shadow-md'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-bl-md shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* LOADING */}
            {loading && (
              <div className="flex justify-start">
                
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center mr-2 flex-shrink-0 shadow-md">
                  <Bot size={15} className="text-white" />
                </div>

                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-slate-100 flex items-center gap-1">
                  <div
                    className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div className="p-3 bg-white border-t border-slate-100">
            
            <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-3 py-2 border border-slate-200">
              
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e =>
                  e.key === 'Enter' && sendMessage()
                }
                placeholder="Escribe tu pregunta..."
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
              />

              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center disabled:opacity-40 hover:scale-105 transition-all shadow-md"
              >
                {loading ? (
                  <Loader2
                    size={16}
                    className="text-white animate-spin"
                  />
                ) : (
                  <Send size={16} className="text-white" />
                )}
              </button>
            </div>

            <p className="text-center text-slate-400 text-[10px] mt-2">
              Powered by AI ✨
            </p>
          </div>
        </div>
      )}

    
      {/* BOTÓN FLOTANTE */}
<button
  onClick={() => setOpen(!open)}
  className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
>
  {open ? (
    <X size={24} className="text-white" />
  ) : (
    <div className="flex flex-col items-center justify-center">
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
        <Bot size={22} className="text-white" />
      </div>
    </div>
  )}
</button>
    </div>
  )
}