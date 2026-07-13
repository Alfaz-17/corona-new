"use client"

import React, { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Message = {
  role: "user" | "model"
  content: string
}

function parseTextWithLinks(text: string) {
  // Simple markdown link parser: [Text](URL)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Add the link component
    parts.push(
      <Link
        key={`link-${match.index}`}
        href={match[2]}
        className="text-primary underline hover:text-primary/80 font-medium"
      >
        {match[1]}
      </Link>
    )
    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Hello! I'm the Corona Marine AI Assistant. I can help you find products, answer questions about our business, and more. How can I help you today?"
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, { role: "user", content: userMessage }] 
        })
      })

      if (!response.ok) throw new Error("Failed to send message")
      
      const data = await response.json()
      
      setMessages(prev => [...prev, { role: "model", content: data.content }])
    } catch (error) {
      console.error("Chat Error:", error)
      setMessages(prev => [
        ...prev, 
        { role: "model", content: "Sorry, I'm having trouble connecting right now. Please try again later." }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-xl hover:scale-105 transition-all duration-300",
          isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        )}
        aria-label="Open AI Chat"
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[90vw] max-w-[400px] h-[600px] max-h-[75vh] flex flex-col shadow-2xl transition-all duration-300 transform origin-bottom-right rounded-2xl overflow-hidden border border-border bg-background",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={24} />
            <div>
              <h3 className="font-bold font-playfair text-lg leading-tight">AI Assistant</h3>
              <p className="text-xs text-primary-foreground/80">Powered by Gemini</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="hover:bg-primary-foreground/20 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"
              )}>
                {msg.role === "user" ? <UserIcon size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm",
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm text-foreground"
              )}>
                {parseTextWithLinks(msg.content)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm flex items-center gap-1.5 h-[42px] px-4">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-background border-t">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products or services..."
              className="flex-1 rounded-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isLoading}
              className="rounded-full shrink-0"
            >
              <Send size={18} />
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
