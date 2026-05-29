import { useEffect, useMemo, useState } from "react"
import axios from "axios"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

const tierClasses = {
  Cold: "bg-red-100 text-red-700",
  Warm: "bg-yellow-100 text-yellow-800",
  Hot: "bg-green-100 text-green-700",
}

function AdminDashboard() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLeadId, setSelectedLeadId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [tierFilter, setTierFilter] = useState("All")
  const [sortKey, setSortKey] = useState("score")

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const response = await axios.get(`${API_BASE}/leads`)
        setLeads(response.data)
      } finally {
        setLoading(false)
      }
    }

    loadLeads()
  }, [])

  useEffect(() => {
    if (!leads.length) {
      setSelectedLeadId(null)
      return
    }

    setSelectedLeadId((current) => current ?? leads[0].id)
  }, [leads])

  const stats = useMemo(() => {
    const total = leads.length
    const hot = leads.filter((lead) => lead.tier === "Hot").length
    const avgScore = total
      ? Math.round(
          leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / total,
        )
      : 0
    const conversion = total ? Math.round((hot / total) * 100) : 0

    return { total, hot, avgScore, conversion }
  }, [leads])

  const filteredLeads = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    return leads.filter((lead) => {
      const matchesTier = tierFilter === "All" || lead.tier === tierFilter
      const matchesSearch =
        !normalized ||
        [lead.name, lead.email, lead.niche]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalized))

      return matchesTier && matchesSearch
    })
  }, [leads, searchTerm, tierFilter])

  const sortedLeads = useMemo(() => {
    const copy = [...filteredLeads]
    if (sortKey === "score") {
      return copy.sort((a, b) => (b.score || 0) - (a.score || 0))
    }
    if (sortKey === "audience") {
      return copy.sort(
        (a, b) => (b.audience_size || 0) - (a.audience_size || 0),
      )
    }
    return copy.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
  }, [filteredLeads, sortKey])

  const selectedLead = sortedLeads.find((lead) => lead.id === selectedLeadId)

  if (loading) {
    return (
      <div className="rounded-3xl bg-white/80 p-6 text-center text-sm">
        Loading leads...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#7a7a7a]">
            Admin workspace
          </p>
          <h2 className="brand-title text-2xl font-semibold text-[#1a1a1a]">
            Leads intelligence
          </h2>
          <p className="mt-1 text-sm text-[#4b4b4b]">
            Prioritize conversations and review intent signals quickly.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-1 items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm shadow-sm md:min-w-[240px]">
            <span className="text-xs uppercase tracking-[0.2em] text-[#7a7a7a]">
              Search
            </span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Name, email, niche"
              className="w-full bg-transparent text-sm text-[#1a1a1a] placeholder:text-[#9a9a9a] focus:outline-none"
              type="text"
            />
          </label>
          <select
            value={tierFilter}
            onChange={(event) => setTierFilter(event.target.value)}
            className="rounded-full bg-white/80 px-4 py-2 text-sm text-[#1a1a1a] shadow-sm focus:outline-none"
          >
            <option value="All">All tiers</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </select>
          <select
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
            className="rounded-full bg-white/80 px-4 py-2 text-sm text-[#1a1a1a] shadow-sm focus:outline-none"
          >
            <option value="score">Sort by score</option>
            <option value="audience">Sort by audience</option>
            <option value="name">Sort by name</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total leads", value: stats.total },
          { label: "Hot leads", value: stats.hot },
          { label: "Avg score", value: stats.avgScore },
          { label: "Conversion", value: `${stats.conversion}%` },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-white/90 p-4 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-[#7a7a7a]">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#1a1a1a]">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-3xl bg-white/90 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#efe6d8] px-4 py-3 text-xs uppercase tracking-wide text-[#6a6156]">
            <span>Priority leads</span>
            <span className="text-[11px] text-[#8a8074]">
              {sortedLeads.length} results
            </span>
          </div>
          {sortedLeads.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#f6f2ea] text-xs uppercase tracking-wide text-[#6a6156]">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Niche</th>
                    <th className="px-4 py-3">Audience</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`cursor-pointer border-t border-[#efe6d8] transition hover:bg-[#fbf7f0] ${
                        selectedLeadId === lead.id ? "bg-[#f5efe5]" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-[#1a1a1a]">
                        <div className="flex flex-col">
                          <span>{lead.name}</span>
                          <span className="text-xs text-[#7a7a7a]">
                            {lead.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#4b4b4b]">
                        {lead.niche}
                      </td>
                      <td className="px-4 py-3 text-[#4b4b4b]">
                        {lead.audience_size}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#1a1a1a]">
                        {lead.score}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            tierClasses[lead.tier] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {lead.tier}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-sm text-[#7a7a7a]">
              No leads match this filter yet. Try adjusting the search or tier.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl bg-white/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7a7a7a]">
              Lead profile
            </p>
            {selectedLead ? (
              <div className="mt-4 space-y-4 text-sm text-[#4b4b4b]">
                <div>
                  <p className="text-lg font-semibold text-[#1a1a1a]">
                    {selectedLead.name}
                  </p>
                  <p>{selectedLead.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#eaf4ef] px-3 py-1 text-xs font-semibold text-[#0f7f5c]">
                    Score {selectedLead.score}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      tierClasses[selectedLead.tier] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedLead.tier}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#7a7a7a]">
                    Niche
                  </p>
                  <p className="mt-1 text-[#1a1a1a]">{selectedLead.niche}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#7a7a7a]">
                    Audience size
                  </p>
                  <p className="mt-1 text-[#1a1a1a]">
                    {selectedLead.audience_size}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#7a7a7a]">
                    Summary
                  </p>
                  <p className="mt-1 leading-relaxed text-[#4b4b4b]">
                    {selectedLead.summary ||
                      "No summary yet. Open the chat to gather more intent signals."}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#7a7a7a]">
                Select a lead to view details and next steps.
              </p>
            )}
          </div>

          <div className="rounded-3xl bg-white/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-[#7a7a7a]">
              Quick actions
            </p>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="rounded-2xl border border-[#efe6d8] px-4 py-3">
                <p className="font-semibold text-[#1a1a1a]">
                  Follow up cadence
                </p>
                <p className="text-[#7a7a7a]">
                  Reach out within 24 hours for hot leads.
                </p>
              </div>
              <div className="rounded-2xl border border-[#efe6d8] px-4 py-3">
                <p className="font-semibold text-[#1a1a1a]">
                  Content fit
                </p>
                <p className="text-[#7a7a7a]">
                  Match offer to creator niche and audience.
                </p>
              </div>
              <div className="rounded-2xl border border-[#efe6d8] px-4 py-3">
                <p className="font-semibold text-[#1a1a1a]">
                  Prep deck
                </p>
                <p className="text-[#7a7a7a]">
                  Export a summary before the next call.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
