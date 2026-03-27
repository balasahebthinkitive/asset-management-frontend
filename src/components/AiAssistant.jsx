// src/components/AiAssistant.jsx
import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are an AI assistant for Thinkitive's Asset Management System.
You help users with:
- Finding and managing assets (laptops, mobiles, monitors, RAM, etc.)
- Understanding asset statuses (assigned, available, maintenance)
- Answering questions about vendors, people, and tickets
- Providing guidance on asset workflows
Be concise, helpful, and professional.`;

const BotIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/>
  </svg>
);

const SendIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const CloseIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function AiAssistant() {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your Asset Management AI. Ask me anything about your assets, vendors, or tickets." }
  ]);
  const bottomRef = useRef(null);
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    if (!apiKey) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ REACT_APP_ANTHROPIC_API_KEY is not set in .env. Restart the server after adding it." }]);
      return;
    }
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Build conversation for API (exclude the initial greeting)
      const conversation = newMessages
        .slice(1)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-opus-4-6",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: conversation,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`${res.status}: ${errData?.error?.message || res.statusText}`);
      }
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't understand that.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `⚠️ Error: ${err.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(o => !o)} style={styles.fab} title="AI Assistant">
        {open ? CloseIcon : BotIcon}
        {!open && <span style={styles.fabLabel}>Ask AI</span>}
      </button>

      {/* Chat window */}
      {open && (
        <div style={styles.window}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatar}>{BotIcon}</div>
              <div>
                <div style={styles.headerTitle}>Asset AI</div>
                <div style={styles.headerSub}>Powered by Claude</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}>{CloseIcon}</button>
          </div>

          {/* Messages */}
          <div style={styles.body}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                {m.role === "assistant" && <div style={styles.botAvatar}>{BotIcon}</div>}
                <div style={m.role === "user" ? styles.userBubble : styles.botBubble}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={styles.botAvatar}>{BotIcon}</div>
                <div style={styles.botBubble}>
                  <span style={styles.dot} /><span style={{ ...styles.dot, animationDelay: "0.2s" }} /><span style={{ ...styles.dot, animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={styles.footer}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about assets, vendors, tickets..."
              rows={1}
              style={styles.input}
            />
            <button onClick={send} disabled={!input.trim() || loading} style={styles.sendBtn}>
              {SendIcon}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
      `}</style>
    </>
  );
}

const styles = {
  fab: {
    position: "fixed", bottom: 24, right: 24, zIndex: 9999,
    display: "flex", alignItems: "center", gap: 8,
    background: "#2878C8", color: "#fff",
    border: "none", borderRadius: 50, padding: "12px 18px",
    cursor: "pointer", boxShadow: "0 4px 16px rgba(40,120,200,0.4)",
    fontWeight: 600, fontSize: 14,
  },
  fabLabel: { fontSize: 13, fontWeight: 600 },
  window: {
    position: "fixed", bottom: 84, right: 24, zIndex: 9998,
    width: 360, height: 500,
    background: "#fff", borderRadius: 16,
    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    display: "flex", flexDirection: "column", overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  header: {
    background: "#2878C8", padding: "14px 16px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: "50%",
    background: "rgba(255,255,255,0.2)", display: "flex",
    alignItems: "center", justifyContent: "center", color: "#fff",
  },
  headerTitle: { color: "#fff", fontWeight: 700, fontSize: 14 },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 11 },
  closeBtn: { background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 4 },
  body: {
    flex: 1, overflowY: "auto", padding: "16px",
    background: "#f8fafc", display: "flex", flexDirection: "column",
  },
  botAvatar: {
    width: 28, height: 28, borderRadius: "50%",
    background: "#EBF4FF", color: "#2878C8",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginRight: 8, flexShrink: 0,
  },
  userBubble: {
    maxWidth: "75%", background: "#2878C8", color: "#fff",
    borderRadius: "18px 18px 4px 18px", padding: "10px 14px",
    fontSize: 13, lineHeight: 1.5,
  },
  botBubble: {
    maxWidth: "75%", background: "#fff", color: "#1f2937",
    borderRadius: "18px 18px 18px 4px", padding: "10px 14px",
    fontSize: 13, lineHeight: 1.5, border: "1px solid #e5e7eb",
    display: "flex", alignItems: "center", gap: 4,
  },
  dot: {
    display: "inline-block", width: 6, height: 6,
    borderRadius: "50%", background: "#2878C8",
    animation: "bounce 1.4s infinite ease-in-out",
  },
  footer: {
    padding: "12px 14px", borderTop: "1px solid #e5e7eb",
    background: "#fff", display: "flex", alignItems: "flex-end", gap: 8,
  },
  input: {
    flex: 1, border: "1px solid #d1d5db", borderRadius: 10,
    padding: "8px 12px", fontSize: 13, resize: "none",
    outline: "none", fontFamily: "inherit", lineHeight: 1.5,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: "50%",
    background: "#2878C8", color: "#fff",
    border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
};
