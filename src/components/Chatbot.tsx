'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  
  // Usamos useChat de la v5
  const { messages, sendMessage, status } = useChat()
  
  // Estado de carga más preciso
  const isLoading = status === 'submitted' || status === 'streaming'
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll automático al recibir nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      sendMessage({ text: input })
      setInput('')
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-xl hover:scale-110 transition-transform z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle size={28} />
      </button>

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] h-[500px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5">
          
          {/* Cabecera */}
          <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <div>
                <h3 className="font-bold text-sm">Asistente de Farmacia</h3>
                <p className="text-[10px] opacity-80">Farmacia del Carmel</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/20 p-1 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm mt-4 italic">
                ¡Hola! Soy tu asistente. ¿Deseas consultar stock, caducidades o dudas de parafarmacia?
              </div>
            )}
            
            {messages.map((m: any) => {
              // MEJORA: Extraemos el texto de forma más segura para la v5
              // Si no hay 'parts', usamos 'content'. Si hay 'parts', unimos solo las de tipo 'text'.
              const textContent = m.parts 
                ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')
                : m.content;

              // Si el mensaje del asistente no tiene texto aún (porque está procesando una Tool), 
              // no renderizamos un globo vacío.
              if (!textContent && m.role === 'assistant') return null;

              return (
                <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot size={16} className="text-primary" />
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-none' 
                      : 'bg-background border border-border text-foreground rounded-bl-none'
                  }`}>
                    <div className="[&>p]:mb-2 last:[&>p]:mb-0 [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:mb-2 [&>strong]:font-bold leading-relaxed">
                      <ReactMarkdown>
                        {textContent}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User size={16} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              )
            })}
            
            {/* Indicador de carga / Pensando */}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center text-muted-foreground text-xs italic animate-pulse">
                <Bot size={14} /> Consultando datos...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de entrada */}
          <form onSubmit={handleSubmit} className="p-3 bg-background border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta..."
              className="flex-1 bg-muted px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button 
              type="submit" 
              disabled={!input || isLoading}
              className="bg-primary text-primary-foreground p-2 rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}