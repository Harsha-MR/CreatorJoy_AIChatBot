import { useEffect, useRef, useState } from "react"
import axios from "axios"
import LeadForm from "./LeadForm"
import MessageBubble from "./MessageBubble"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

const WELCOME_MESSAGE =
  "Hi! I'm the CreatorJoy assistant. What kind of content do you create?"

function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const [leadFormVisible, setLeadFormVisible] = useState(false)
  const [isWaking, setIsWaking] = useState(false)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const hasSentRef = useRef(false)

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: "assistant", text: WELCOME_MESSAGE }])
    }
  }, [messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping, leadFormVisible])

  useEffect(() => {
    const inputEl = inputRef.current
    if (!inputEl) {
      return
    }
    inputEl.style.height = "auto"
    inputEl.style.height = `${inputEl.scrollHeight}px`
  }, [inputText])

  const handleSend = async () => {
    const trimmed = inputText.trim()
    if (!trimmed) {
      return
    }

    const historyForApi = messages.map((message) => ({
      role: message.role,
      text: message.text,
    }))

    setMessages((prev) => [...prev, { role: "user", text: trimmed }])
    setInputText("")
    setIsTyping(true)

    if (!hasSentRef.current) {
      setIsWaking(true)
      hasSentRef.current = true
    }

    try {
      const response = await axios.post(`${API_BASE}/chat`, {
        message: trimmed,
        conversation_history: historyForApi,
        session_id: sessionId,
      })
      const reply = response.data.reply
      setMessages((prev) => [...prev, { role: "assistant", text: reply }])

      const userReplyCount = historyForApi.filter(
        (item) => item.role === "user",
      ).length
      if (userReplyCount >= 4) {
        setLeadFormVisible(true)
      }
    } catch (error) {
      const status = error?.response?.status
      const detail = error?.response?.data?.detail
      if (status === 429) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text:
              detail ||
              "We're at the Gemini rate limit. Please wait a minute and try again.",
          },
        ])
        return
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I hit a snag reaching the AI. Please try again in a moment.",
        },
      ])
    } finally {
      setIsTyping(false)
      setIsWaking(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="chat-scroll flex-1 space-y-4 overflow-y-auto rounded-3xl bg-white/60 p-5 shadow-inner">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className="fade-in">
            <MessageBubble role={message.role} text={message.text} />
          </div>
        ))}
        {isTyping ? (
          <div className="flex items-center gap-3 text-sm text-[#4b4b4b]">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#0f7f5c]"></div>
            <span>CreatorJoy is typing...</span>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {isWaking ? (
        <div className="rounded-2xl bg-[#f5c04a]/20 px-4 py-3 text-sm text-[#7a5200]">
          Starting up AI... (may take 30s on first load)
        </div>
      ) : null}

      {leadFormVisible ? (
        <LeadForm conversationHistory={messages} />
      ) : null}

      <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-3 shadow-sm">
        <textarea
          ref={inputRef}
          rows={1}
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your reply..."
          className="flex-1 resize-none bg-transparent text-sm text-[#1a1a1a] placeholder:text-[#7a7a7a] focus:outline-none md:text-base"
        />
        <button
          type="button"
          onClick={handleSend}
          className="rounded-full bg-[#0f7f5c] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0c5f45]"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatWindow
