import { Link, Route, Routes, useLocation } from "react-router-dom"
import AdminDashboard from "./components/AdminDashboard"
import ChatWindow from "./components/ChatWindow"

function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith("/admin")

  return (
    <div className="min-h-screen px-4 py-10">
      <div
        className={`mx-auto flex w-full flex-col gap-6 ${
          isAdmin ? "max-w-[1100px]" : "max-w-[520px]"
        }`}
      >
        <header className="glass-panel rounded-3xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#7a7a7a]">
                CreatorJoy AI
              </p>
              <h1 className="brand-title text-2xl font-semibold text-[#1a1a1a]">
                Chat Sales Studio
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#4b4b4b]">
              <span className="h-2 w-2 rounded-full bg-[#0f7f5c]"></span>
              Online
            </div>
          </div>
          <nav className="mt-4 flex gap-3 text-sm">
            <Link
              className={`rounded-full px-3 py-1 font-semibold transition ${
                isAdmin
                  ? "text-[#4b4b4b] hover:text-[#0f7f5c]"
                  : "bg-[#eaf4ef] text-[#0f7f5c]"
              }`}
              to="/"
            >
              Chat
            </Link>
            <Link
              className={`rounded-full px-3 py-1 font-semibold transition ${
                isAdmin
                  ? "bg-[#eaf4ef] text-[#0f7f5c]"
                  : "text-[#4b4b4b] hover:text-[#0f7f5c]"
              }`}
              to="/admin"
            >
              Admin
            </Link>
          </nav>
        </header>

        <main
          className={`glass-panel rounded-[32px] p-5 ${
            isAdmin ? "min-h-[620px]" : "min-h-[560px]"
          }`}
        >
          <Routes>
            <Route path="/" element={<ChatWindow />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
