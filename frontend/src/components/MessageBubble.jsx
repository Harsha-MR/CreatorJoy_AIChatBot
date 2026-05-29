function MessageBubble({ role, text }) {
  const isUser = role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#0f7f5c] text-xs font-semibold text-white">
          CJ
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm md:text-base ${
          isUser
            ? "bg-[#0f7f5c] text-white"
            : "bg-white/90 text-[#1a1a1a]"
        }`}
      >
        {text}
      </div>
    </div>
  )
}

export default MessageBubble
