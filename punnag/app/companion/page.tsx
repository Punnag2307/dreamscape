"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Moon, Send, Trash2, User, AlertCircle } from "lucide-react"
import ReactMarkdown from 'react-markdown'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StarField } from "@/components/star-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { saveChat } from "@/lib/firebase"
import { UserNav } from "@/components/user-nav"
import { generateDreamCompanionResponse } from "@/lib/gemini"

type Message = {
  id: number
  content: string
  sender: "user" | "ai"
  timestamp: string
}

export default function CompanionPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Welcome to the Dream Companion. I'm here to help you explore your imagination and create stunning dreamscapes. What kind of dream would you like to explore today?",
      sender: "ai",
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() || !user) return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)
    setError(null)

    try {
      // Call Gemini API for a response
      const aiResponse = await generateDreamCompanionResponse(input)

      const aiMessage: Message = {
        id: messages.length + 2,
        content: aiResponse,
        sender: "ai",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, aiMessage])

      // Save chat to Firebase
      if (user) {
        const updatedMessages = [...messages, userMessage, aiMessage]
        await saveChat(user.uid, {
          messages: updatedMessages.map((m) => ({
            content: m.content,
            sender: m.sender,
            timestamp: m.timestamp,
          })),
          title: "Dream Conversation",
          createdAt: messages[0].timestamp,
          updatedAt: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.error("Error with AI response:", err)
      setError("Failed to get AI response. Please try again.")
    } finally {
      setIsTyping(false)
    }
  }

  // Handle clearing the chat
  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        content:
          "Welcome to the Dream Companion. I'm here to help you explore your imagination and create stunning dreamscapes. What kind of dream would you like to explore today?",
        sender: "ai",
        timestamp: new Date().toISOString(),
      },
    ])
    setError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050a1f] text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050a1f] text-white flex flex-col relative">
      {/* Star field background */}
      <StarField />

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[20%] left-[10%] w-32 h-32 rounded-full bg-purple-500/10 blur-xl"
          animate={{
            y: [0, 20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-[30%] right-[15%] w-40 h-40 rounded-full bg-blue-500/10 blur-xl"
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Header */}
      <header className="py-4 px-4 border-b border-white/10 bg-[#050a1f]/80 backdrop-blur-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Back to Home</span>
          </Link>

          <h1 className="text-xl font-serif absolute left-1/2 transform -translate-x-1/2 hidden md:block">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Dream Companion
            </span>
          </h1>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={handleClearChat}>
              <Trash2 className="h-5 w-5" />
            </Button>
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile title */}
        <div className="md:hidden text-center py-4">
          <h1 className="text-xl font-serif">
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Dream Companion
            </span>
          </h1>
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mx-4 my-2 bg-red-500/10 border-red-500/30 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl p-4",
                      message.sender === "user"
                        ? "bg-purple-600/30 rounded-tr-none"
                        : "bg-[#0a1535]/70 backdrop-blur-sm border border-white/10 rounded-tl-none",
                    )}
                  >
                    <div className="flex items-start">
                      {message.sender === "ai" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
                          <Moon className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium mb-1">{message.sender === "ai" ? "Dream Companion" : "You"}</div>
                        {message.sender === 'ai' ? (
                          <div className="text-sm prose prose-invert prose-sm max-w-none prose-p:my-2 prose-li:my-1">
                             <ReactMarkdown>
                                 {message.content}
                             </ReactMarkdown>
                          </div>
                        ) : (
                          <div className={cn("text-sm")}>
                          {message.content}
                        </div>
                        )}
                      </div>
                      {message.sender === "user" && (
                        <div className="w-8 h-8 rounded-full bg-purple-600/50 flex items-center justify-center ml-3 flex-shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* AI typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-start"
                >
                  <div className="max-w-[80%] rounded-2xl p-4 bg-[#0a1535]/70 backdrop-blur-sm border border-white/10 rounded-tl-none">
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mr-3 flex-shrink-0">
                        <Moon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm mb-1">Dream Companion</div>
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 rounded-full bg-white/50 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-white/50 animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-white/50 animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-white/10 bg-[#050a1f]/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Describe your dream or ask for guidance..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-white/5 border-white/10 focus:border-purple-500/50"
                disabled={isTyping}
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full w-10 h-10 p-0 flex-shrink-0"
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                "Help me create a cosmic dreamscape",
                "How do I make my dreams more vivid?",
                "Suggest a surreal landscape idea",
                "What mood works best for nostalgic dreams?",
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs border-white/10 hover:bg-white/10 rounded-full"
                  onClick={() => {
                    setInput(suggestion)
                  }}
                  disabled={isTyping}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
