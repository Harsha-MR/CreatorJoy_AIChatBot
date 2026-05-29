import { useMemo, useState } from "react"
import axios from "axios"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

function extractLeadSignals(messages) {
  const userMessages = messages
    .filter((message) => message.role === "user")
    .map((message) => message.text)

  return {
    niche: userMessages[0] || "",
    audience_size: userMessages[1] || "",
    current_income: userMessages[2] || "",
    pain_point: userMessages[3] || "",
    commitment_signal: userMessages[4] || "",
  }
}

function LeadForm({ conversationHistory, onSubmitted }) {
  const [formState, setFormState] = useState({ name: "", email: "" })
  const [status, setStatus] = useState("idle")
  const [error, setError] = useState("")

  const extracted = useMemo(
    () => extractLeadSignals(conversationHistory),
    [conversationHistory],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus("loading")
    setError("")

    try {
      const response = await axios.post(`${API_BASE}/leads`, {
        name: formState.name,
        email: formState.email,
        ...extracted,
      })
      setStatus("success")
      onSubmitted?.(response.data)
    } catch (submitError) {
      setStatus("idle")
      setError("Something went wrong. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-white/90 p-6 shadow-sm">
        <p className="text-lg font-semibold text-[#0f7f5c]">
          Booking confirmed! Check your email.
        </p>
        <p className="mt-2 text-sm text-[#4b4b4b]">
          Want to lock a time now? Grab a slot below.
        </p>
        <a
          href="https://calendly.com/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-[#0f7f5c] px-5 py-2 text-sm font-semibold text-white"
        >
          Open Calendly
        </a>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white/90 p-6 shadow-sm"
    >
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
          Name
        </label>
        <input
          type="text"
          name="name"
          value={formState.name}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-[#e7e0d5] px-4 py-2 text-sm focus:border-[#0f7f5c] focus:outline-none"
        />
      </div>
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-[#1a1a1a]">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formState.email}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-[#e7e0d5] px-4 py-2 text-sm focus:border-[#0f7f5c] focus:outline-none"
        />
      </div>
      {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-[#0f7f5c] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0c5f45] disabled:opacity-60"
      >
        {status === "loading" ? "Saving..." : "Submit & Book"}
      </button>
    </form>
  )
}

export default LeadForm
