import { useState, useRef } from "react";

// ─── FÉLIX'S PROFILE ────────────────────────────────────────────────────────
// This is what makes every insight personal to YOU.
// The AI reads this before writing anything so it knows who it's talking to.
const FELIX_PROFILE = `
Name: Dr. Félix Rivera, MD
Specialty: Neurologist — clinical expertise in stroke, epilepsy, neurocritical care
Career Goal: Clinical Lead or Medical Director at Google or DeepMind by July 2026
Advising Interest: Wants to become a neurotech startup advisor (all stages: seed to Series C)
Investing Interest: Learning to invest in neurotech — wants to spot opportunities early
Background Edge: US/LATAM bilingual — Latin American market is a unique strategic advantage
Apps Building: Neuro-Triage, Neuro-Scribe, Neuro-Audit, Clinical Truth Graph, Synthetic Patient Pipeline
Teaching Note: Félix is not a tech expert. Explain everything simply, like teaching a smart doctor who is new to AI and startups.
`;

const SECTIONS = [
  { id: "neurotech",      icon: "🧠", label: "AI & Neurotech",      color: "#00FFD1" },
  { id: "bigtech",        icon: "🔬", label: "Big Tech Health",      color: "#4FC3F7" },
  { id: "investment",     icon: "💰", label: "Investment Radar",     color: "#FFD700" },
  { id: "generalmedicine",icon: "⚕️",  label: "General Medicine AI", color: "#B39DDB" },
  { id: "regulation",     icon: "⚖️",  label: "Regulation",          color: "#FF8A65" },
  { id: "companies",      icon: "🎯", label: "Contact Radar",        color: "#A5D6A7" },
];

// ─── WHAT EACH SECTION MEANS (shown to Félix in plain English) ───────────────
const SECTION_EXPLAINERS = {
  neurotech:       "New AI tools, research papers, and breakthroughs happening right now in brain and nervous system medicine — from stroke detection to brain-computer interfaces.",
  bigtech:         "What the biggest technology companies (Google, DeepMind, Amazon AWS, NVIDIA) are doing specifically in brain and health AI. These are your future employers and partners.",
  investment:      "Who is putting money into neurotech right now, how much, and what that tells us about where the field is heading.",
  generalmedicine: "A few key AI advances happening in medicine broadly — good to know as a physician even if it's not your specialty.",
  regulation:      "New rules and laws affecting AI in healthcare. Important for your apps — you need to know what's legal and what's required.",
  companies:       "Specific neurotech companies that could benefit from your expertise. These are companies you could advise, partner with, or eventually invest in.",
};

// ─── SYSTEM PROMPT ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a Strategic Intelligence Analyst and personal advisor for Dr. Félix Rivera, MD.

FÉLIX'S PROFILE:
${FELIX_PROFILE}

YOUR WRITING RULES:
- Write like you're explaining to a brilliant doctor who is brand new to tech and startups
- No jargon without explanation. If you use a tech term, immediately explain it in parentheses
- Every insight must connect back to Félix's specific situation
- Be encouraging but honest — this is his personal coach, not a press release

YOUR TASK:
Search the last 48 hours of global news, research, and funding. Generate a full briefing in JSON.

COVERAGE DOMAINS:
1. neurotech: AI advances in neurology, psychiatry, BCI (brain-computer interfaces), stroke, epilepsy, sleep, pain, cognitive decline
2. bigtech: Google, DeepMind, AWS, NVIDIA, Microsoft, Apple moves in health AI and neurotech
3. investment: VC funding rounds, deal flow, trends in neurotech investing
4. generalmedicine: 2-3 key AI advances in broader medicine
5. regulation: FDA, CMS, AB489, clinical AI governance updates
6. companies: Neurotech companies (all stages) Félix should contact for advising, partnership, or investment

OUTPUT: Respond ONLY with valid JSON. No markdown. No backticks. No preamble. Exactly this structure:

{
  "generatedAt": "ISO timestamp",
  "sections": {
    "neurotech": {
      "items": [
        {
          "headline": "Short punchy headline — 8 words max",
          "source": "Where this came from (journal, company, news outlet)",
          "brief": "One plain-English sentence. What happened.",
          "deepDive": "3-4 sentences. Explain the science or business development simply. Imagine explaining to a smart doctor who has never built an app.",
          "felixRelevance": "2-3 sentences starting with 'Félix, this matters to you because...' — connect it directly to his career goal, his apps, his LATAM advantage, or his investing/advising path. Be specific, not generic.",
          "strategicTake": "One concrete next step or observation. What should he DO or WATCH because of this?"
        }
      ]
    },
    "bigtech":         { "items": [/* same structure */] },
    "investment":      { "items": [/* same structure */] },
    "generalmedicine": { "items": [/* same structure */] },
    "regulation":      { "items": [/* same structure */] },
    "companies": {
      "items": [
        {
          "headline": "Company Name — Funding Stage",
          "source": "Company website or news source",
          "brief": "One sentence: what they build and why it matters.",
          "deepDive": "What problem they solve, how their technology works (simply), recent news or funding.",
          "felixRelevance": "Félix, this matters to you because... — be specific: advising angle, clinical expertise gap they have, LATAM opportunity, investment timing.",
          "strategicTake": "Exact outreach suggestion: what to say, what role to propose, what email subject line to use."
        }
      ]
    }
  },
  "personalSummary": "3-4 sentences written directly to Félix. Summarize the most important theme from this entire 48-hour cycle. What is the single biggest signal or opportunity he should not miss? Write warmly, like a trusted advisor who knows him.",
  "actionItem": "The single most important action Félix should take in the next 48 hours. One sentence. Specific. Actionable.",
  "carModeScript": "A 4-5 minute spoken briefing written like a friendly podcast. Address Félix by name. Explain everything simply — no bullet points, just flowing conversation. Cover the top 2 items from each section. End with the action item and one sentence of encouragement. This will be read aloud while he drives.",
  "emailSubject": "A subject line for the Gmail notification. Format: 🧠 Neuro-Intel [Date] — [most interesting headline from this cycle]"
}`;

// ─── EMAIL FORMATTER ─────────────────────────────────────────────────────────
// Converts the briefing into a clean HTML email Félix receives on his phone
function buildEmailHTML(briefing) {
  let sectionsHTML = "";
  SECTIONS.forEach(s => {
    const items = briefing.sections?.[s.id]?.items || [];
    if (!items.length) return;
    sectionsHTML += `
      <div style="margin-bottom:28px;">
        <h2 style="color:${s.color};font-size:14px;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;border-bottom:1px solid #1a3a2a;padding-bottom:8px;">
          ${s.icon} ${s.label}
        </h2>
        ${items.map(item => `
          <div style="margin-bottom:16px;padding:14px;background:#0a1810;border-radius:8px;border-left:3px solid ${s.color}40;">
            <div style="color:#e0ece6;font-size:13px;font-weight:bold;margin-bottom:4px;">${item.headline}</div>
            <div style="color:#4a7a5a;font-size:12px;margin-bottom:8px;">${item.source} — ${item.brief}</div>
            <div style="color:#00FFD1;font-size:11px;letter-spacing:1px;margin-bottom:4px;">FÉLIX, THIS MATTERS TO YOU:</div>
            <div style="color:#a0c0b0;font-size:12px;line-height:1.6;">${item.felixRelevance}</div>
          </div>
        `).join("")}
      </div>`;
  });

  return `
    <!DOCTYPE html><html><body style="background:#050A0E;color:#c0d0c8;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="text-align:center;padding:24px 0;border-bottom:1px solid #0d2018;margin-bottom:24px;">
        <div style="font-size:28px;margin-bottom:8px;">🧠</div>
        <h1 style="color:#00FFD1;font-size:18px;letter-spacing:3px;font-weight:300;text-transform:uppercase;">Neuro-Intel Briefing</h1>
        <div style="color:#2a5a44;font-size:11px;letter-spacing:2px;">DR. FÉLIX RIVERA, MD • PERSONAL INTELLIGENCE</div>
      </div>

      ${briefing.personalSummary ? `
      <div style="background:#0a1810;border:1px solid #00FFD130;border-radius:10px;padding:16px;margin-bottom:24px;">
        <div style="color:#00FFD1;font-size:11px;letter-spacing:2px;margin-bottom:8px;">YOUR PERSONAL SUMMARY</div>
        <div style="color:#c0d8c8;font-size:13px;line-height:1.7;">${briefing.personalSummary}</div>
      </div>` : ""}

      ${briefing.actionItem ? `
      <div style="background:#0a1810;border-left:3px solid #00FFD1;border-radius:6px;padding:14px;margin-bottom:24px;">
        <div style="color:#00FFD1;font-size:11px;letter-spacing:2px;margin-bottom:6px;">🏁 48-HOUR ACTION ITEM</div>
        <div style="color:#e0ece6;font-size:13px;line-height:1.6;">${briefing.actionItem}</div>
      </div>` : ""}

      ${sectionsHTML}

      <div style="text-align:center;padding-top:20px;border-top:1px solid #0d2018;color:#1a3a2a;font-size:11px;letter-spacing:1px;">
        NEURO-INTEL • CONFIDENTIAL PERSONAL BRIEFING • GENERATED BY CLAUDE
      </div>
    </body></html>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function NeuroIntelV2() {
  const [briefing, setBriefing]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [activeSection, setActiveSection] = useState("neurotech");
  const [expandedItem, setExpandedItem] = useState(null);
  const [carMode, setCarMode]           = useState(false);
  const [speaking, setSpeaking]         = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput]       = useState("");
  const [chatLoading, setChatLoading]   = useState(false);
  const [emailStatus, setEmailStatus]   = useState(null);
  const [userEmail, setUserEmail]       = useState("");
  const [showEmailSetup, setShowEmailSetup] = useState(false);
  const chatEndRef = useRef(null);

  // ── GENERATE BRIEFING ────────────────────────────────────────────────────
  const generateBriefing = async () => {
    setLoading(true);
    setError(null);
    setExpandedItem(null);
    setBriefing(null);
    setChatMessages([]);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{
            role: "user",
            content: `Generate my Neuro-Intel Briefing. Today is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}. Search for the most recent 48 hours of developments. Return ONLY the JSON object.`
          }]
        })
      });

      const data = await res.json();
      const textBlock = data.content?.find(b => b.type === "text");
      if (!textBlock) throw new Error("No response received from Claude.");

      let json = textBlock.text.trim()
        .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      const parsed = JSON.parse(json);

      setBriefing(parsed);
      setLastGenerated(new Date());
      setActiveSection("neurotech");

      // Add a welcome chat message
      setChatMessages([{
        role: "assistant",
        content: `Hi Félix! Your briefing is ready. I've covered ${SECTIONS.length} domains from the last 48 hours. Ask me anything — "What is a BCI?", "Should I contact this company?", "Explain this funding round simply" — I'm here to teach and advise. 🧠`
      }]);

    } catch (err) {
      setError("Something went wrong generating the briefing. Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── CHAT Q&A ─────────────────────────────────────────────────────────────
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user", content: userMsg }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      const briefingSummary = briefing ? JSON.stringify(briefing).slice(0, 3000) : "No briefing loaded yet.";
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          system: `You are Félix's personal advisor and teacher. He is a neurologist learning about AI, startups, and investing. 
          
ALWAYS explain things simply — like teaching a brilliant doctor who is brand new to tech. Define any jargon in plain English immediately after using it.

Current briefing context (use this to answer questions):
${briefingSummary}

Félix's profile: ${FELIX_PROFILE}

Keep answers conversational, warm, and under 150 words unless a longer explanation is truly needed.`,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Sorry, I couldn't generate a response.";
      setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Try asking again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── SPEECH ───────────────────────────────────────────────────────────────
  const speak = (text) => {
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92; u.pitch = 1; u.lang = "en-US";
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };
  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };

  // ── EMAIL SEND (via Gmail MCP) ────────────────────────────────────────────
  const sendEmailBriefing = async () => {
    if (!userEmail || !briefing) return;
    setEmailStatus("sending");
    try {
      const emailHTML = buildEmailHTML(briefing);
      const subject = briefing.emailSubject || `🧠 Neuro-Intel Briefing — ${new Date().toLocaleDateString()}`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          mcp_servers: [{ type: "url", url: "https://gmail.mcp.claude.com/mcp", name: "gmail-mcp" }],
          messages: [{
            role: "user",
            content: `Send an email to ${userEmail} with subject "${subject}" and this HTML body: ${emailHTML}. Confirm when sent.`
          }]
        })
      });
      await res.json();
      setEmailStatus("sent");
      setTimeout(() => setEmailStatus(null), 4000);
    } catch {
      setEmailStatus("error");
      setTimeout(() => setEmailStatus(null), 3000);
    }
  };

  const currentSection = SECTIONS.find(s => s.id === activeSection);
  const currentItems   = briefing?.sections?.[activeSection]?.items || [];

  // ══════════════════════════════════════════════════════════════════════════
  // CAR MODE SCREEN
  // ══════════════════════════════════════════════════════════════════════════
  if (carMode && briefing) {
    return (
      <div style={{ minHeight: "100vh", background: "#050A0E", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", padding: "2rem" }}>
        <style>{`@keyframes pulse{0%,100%{transform:scale(1);box-shadow:0 0 30px #00FFD150}50%{transform:scale(1.06);box-shadow:0 0 70px #00FFD1aa}} @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ textAlign: "center", maxWidth: "520px", animation: "fadeIn 0.5s ease" }}>
          <div style={{
            width: "130px", height: "130px", borderRadius: "50%",
            background: speaking ? "radial-gradient(circle, #00FFD1 0%, #003322 60%)" : "radial-gradient(circle, #1a3a2a 0%, #050A0E 70%)",
            margin: "0 auto 2rem", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "3.5rem", animation: speaking ? "pulse 1.8s infinite" : "none", transition: "all 0.5s"
          }}>
            {speaking ? "🎙️" : "🧠"}
          </div>
          <h1 style={{ color: "#00FFD1", fontSize: "1.6rem", fontWeight: "300", letterSpacing: "0.2em", marginBottom: "0.4rem" }}>CAR MODE</h1>
          <p style={{ color: "#2a5a44", fontSize: "0.85rem", marginBottom: "2.5rem", letterSpacing: "0.05em" }}>
            {speaking ? "Playing your Neuro-Intel Briefing..." : "Tap Play when ready to drive"}
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
            {!speaking
              ? <button onClick={() => speak(briefing.carModeScript)} style={{ background: "#00FFD1", color: "#050A0E", border: "none", padding: "0.9rem 2.2rem", borderRadius: "50px", fontSize: "1rem", fontWeight: "700", cursor: "pointer", letterSpacing: "0.05em" }}>▶ Play Briefing</button>
              : <button onClick={stopSpeaking} style={{ background: "#FF8A65", color: "#050A0E", border: "none", padding: "0.9rem 2.2rem", borderRadius: "50px", fontSize: "1rem", fontWeight: "700", cursor: "pointer" }}>⏹ Stop</button>
            }
            <button onClick={() => { stopSpeaking(); setCarMode(false); }} style={{ background: "transparent", color: "#2a5a44", border: "1px solid #1a3a2a", padding: "0.9rem 1.8rem", borderRadius: "50px", fontSize: "0.9rem", cursor: "pointer" }}>← Dashboard</button>
          </div>
          {briefing.actionItem && (
            <div style={{ background: "#0a1810", border: "1px solid #1a3a2a", borderRadius: "14px", padding: "1.25rem", textAlign: "left" }}>
              <div style={{ color: "#00FFD1", fontSize: "0.7rem", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>🏁 YOUR ACTION ITEM</div>
              <div style={{ color: "#a0c0b0", fontSize: "0.88rem", lineHeight: "1.6" }}>{briefing.actionItem}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MAIN DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: "100vh", background: "#050A0E", fontFamily: "Georgia, serif", color: "#c0d0c8" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#1a3a2a;border-radius:4px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes shimmer{0%,100%{opacity:.4}50%{opacity:1}}
        .card:hover{background:#0d1e16!important;transform:translateY(-1px)}
        .sec-btn:hover{opacity:1!important}
        .btn:hover{opacity:.85!important}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background: "#06100C", borderBottom: "1px solid #0d2018", padding: "1.2rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "1.4rem" }}>🧠</span>
            <span style={{ color: "#00FFD1", fontSize: "1.1rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Neuro-Intel Briefing</span>
          </div>
          <div style={{ color: "#1a4a30", fontSize: "0.7rem", marginTop: "0.2rem", letterSpacing: "0.1em" }}>
            DR. FÉLIX RIVERA, MD &nbsp;·&nbsp; PERSONAL STRATEGIC INTELLIGENCE
            {lastGenerated && <span style={{ color: "#2a5a44" }}>&nbsp;·&nbsp; Updated {lastGenerated.toLocaleTimeString()}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          {briefing && (
            <>
              <button className="btn" onClick={() => setShowEmailSetup(v => !v)} style={{ background: "transparent", border: "1px solid #1a3a2a", color: "#4a7a5a", padding: "0.45rem 1rem", borderRadius: "50px", fontSize: "0.75rem", cursor: "pointer", transition: "all .2s" }}>
                📧 Email to Phone
              </button>
              <button className="btn" onClick={() => setCarMode(true)} style={{ background: "transparent", border: "1px solid #00FFD150", color: "#00FFD1", padding: "0.45rem 1rem", borderRadius: "50px", fontSize: "0.75rem", cursor: "pointer", transition: "all .2s" }}>
                🚗 Car Mode
              </button>
            </>
          )}
          <button className="btn" onClick={generateBriefing} disabled={loading} style={{ background: loading ? "#0d2018" : "#00FFD1", color: loading ? "#00FFD1" : "#050A0E", border: "none", padding: "0.5rem 1.4rem", borderRadius: "50px", fontSize: "0.82rem", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.06em", animation: loading ? "shimmer 1.5s infinite" : "none", transition: "all .2s" }}>
            {loading ? "⟳ Scanning..." : briefing ? "↻ Refresh" : "▶ Generate Briefing"}
          </button>
        </div>
      </div>

      {/* ── EMAIL SETUP PANEL ── */}
      {showEmailSetup && briefing && (
        <div style={{ background: "#060e09", borderBottom: "1px solid #0d2018", padding: "1rem 1.5rem", display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ color: "#2a6a44", fontSize: "0.78rem", letterSpacing: "0.08em" }}>📧 SEND TO GMAIL:</div>
          <input
            value={userEmail} onChange={e => setUserEmail(e.target.value)}
            placeholder="your@gmail.com"
            style={{ background: "#0a1810", border: "1px solid #1a3a2a", color: "#c0d0c8", padding: "0.4rem 0.9rem", borderRadius: "8px", fontSize: "0.82rem", outline: "none", minWidth: "220px" }}
          />
          <button onClick={sendEmailBriefing} disabled={emailStatus === "sending" || !userEmail} style={{ background: emailStatus === "sent" ? "#A5D6A7" : "#00FFD1", color: "#050A0E", border: "none", padding: "0.4rem 1.2rem", borderRadius: "50px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}>
            {emailStatus === "sending" ? "Sending..." : emailStatus === "sent" ? "✓ Sent!" : emailStatus === "error" ? "⚠ Error" : "Send Now"}
          </button>
          <div style={{ color: "#1a3a2a", fontSize: "0.72rem" }}>This will arrive in Gmail on your phone like a normal email.</div>
        </div>
      )}

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "1.5rem" }}>

        {/* ── EMPTY STATE ── */}
        {!briefing && !loading && !error && (
          <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1.5rem", opacity: 0.2 }}>🧠</div>
            <h2 style={{ color: "#1a4a30", fontWeight: "300", fontSize: "1.3rem", marginBottom: "1rem", letterSpacing: "0.12em" }}>READY TO BRIEF YOU, FÉLIX</h2>
            <p style={{ color: "#1a3a2a", fontSize: "0.88rem", maxWidth: "380px", margin: "0 auto 2rem", lineHeight: "1.8" }}>
              Click Generate and I'll scan the last 48 hours across AI neurotech, Big Tech health moves, investment activity, regulation, and companies worth contacting — all tailored to your situation.
            </p>
            <button onClick={generateBriefing} style={{ background: "#00FFD1", color: "#050A0E", border: "none", padding: "0.9rem 2.5rem", borderRadius: "50px", fontSize: "1rem", fontWeight: "700", cursor: "pointer" }}>Generate My Briefing</button>
          </div>
        )}

        {/* ── LOADING ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
            <div style={{ width: "50px", height: "50px", border: "2px solid #0d2018", borderTop: "2px solid #00FFD1", borderRadius: "50%", margin: "0 auto 1.5rem", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "#2a5a44", letterSpacing: "0.15em", fontSize: "0.82rem" }}>SCANNING LAST 48 HOURS...</p>
            <p style={{ color: "#1a3a2a", fontSize: "0.72rem", marginTop: "0.4rem" }}>Searching neurotech research · Big Tech moves · Funding activity · Companies</p>
          </div>
        )}

        {/* ── ERROR ── */}
        {error && <div style={{ background: "#1a0a08", border: "1px solid #5a2018", borderRadius: "10px", padding: "1.25rem", marginBottom: "1.5rem" }}><div style={{ color: "#FF8A65", marginBottom: "0.4rem" }}>⚠ Error</div><div style={{ color: "#8a5a4a", fontSize: "0.82rem" }}>{error}</div></div>}

        {briefing && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>

            {/* ── PERSONAL SUMMARY ── */}
            {briefing.personalSummary && (
              <div style={{ background: "linear-gradient(135deg, #0a2018, #061410)", border: "1px solid #00FFD125", borderRadius: "14px", padding: "1.4rem", marginBottom: "1.5rem" }}>
                <div style={{ color: "#00FFD1", fontSize: "0.68rem", letterSpacing: "0.18em", marginBottom: "0.6rem" }}>💬 YOUR PERSONAL SUMMARY</div>
                <div style={{ color: "#c0d8c8", fontSize: "0.9rem", lineHeight: "1.75" }}>{briefing.personalSummary}</div>
              </div>
            )}

            {/* ── ACTION ITEM ── */}
            {briefing.actionItem && (
              <div style={{ background: "#060e09", borderLeft: "3px solid #00FFD1", borderRadius: "8px", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", gap: "0.75rem" }}>
                <span style={{ flexShrink: 0 }}>🏁</span>
                <div>
                  <div style={{ color: "#00FFD1", fontSize: "0.68rem", letterSpacing: "0.15em", marginBottom: "0.3rem" }}>48-HOUR ACTION ITEM</div>
                  <div style={{ color: "#e0ece6", fontSize: "0.88rem", lineHeight: "1.6" }}>{briefing.actionItem}</div>
                </div>
              </div>
            )}

            {/* ── SECTION TABS ── */}
            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => { setActiveSection(s.id); setExpandedItem(null); }} className="sec-btn"
                  style={{ background: activeSection === s.id ? s.color + "18" : "transparent", border: `1px solid ${activeSection === s.id ? s.color : "#0d2018"}`, color: activeSection === s.id ? s.color : "#2a5a44", padding: "0.35rem 0.8rem", borderRadius: "50px", fontSize: "0.76rem", cursor: "pointer", transition: "all .2s", opacity: activeSection === s.id ? 1 : 0.65 }}>
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            {/* ── SECTION EXPLAINER ── */}
            <div style={{ background: "#060e09", border: "1px solid #0a1e12", borderRadius: "8px", padding: "0.7rem 1rem", marginBottom: "1.25rem", fontSize: "0.78rem", color: "#2a6a44", lineHeight: "1.6" }}>
              <strong style={{ color: "#4a8a64" }}>What is this section?</strong> {SECTION_EXPLAINERS[activeSection]}
            </div>

            {/* ── ITEMS ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "2rem" }}>
              {currentItems.length === 0 && <div style={{ color: "#1a3a2a", padding: "2rem", textAlign: "center", fontSize: "0.82rem" }}>No major developments this cycle.</div>}

              {currentItems.map((item, idx) => {
                const isExpanded = expandedItem === idx;
                const col = currentSection?.color || "#00FFD1";
                return (
                  <div key={idx} className="card" onClick={() => setExpandedItem(isExpanded ? null : idx)}
                    style={{ background: isExpanded ? "#0d1e16" : "#080f0b", border: `1px solid ${isExpanded ? col + "40" : "#0d2018"}`, borderRadius: "11px", padding: "1.1rem", cursor: "pointer", transition: "all .2s" }}>

                    {/* Brief row */}
                    <div style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: col, flexShrink: 0, marginTop: "0.38rem" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                          <div>
                            <span style={{ color: col, fontSize: "0.74rem", fontWeight: "bold" }}>{item.source}</span>
                            <span style={{ color: "#e0ece6", fontSize: "0.88rem" }}> — {item.headline}</span>
                            <div style={{ color: "#4a7a5a", fontSize: "0.78rem", marginTop: "0.2rem" }}>{item.brief}</div>
                          </div>
                          <div style={{ color: col, fontSize: "0.68rem", flexShrink: 0, opacity: 0.5 }}>{isExpanded ? "▲" : "▼"}</div>
                        </div>

                        {/* Expanded */}
                        {isExpanded && (
                          <div style={{ marginTop: "1rem", animation: "fadeIn 0.3s ease" }}>

                            {/* Deep Dive */}
                            <div style={{ background: "#060d09", borderRadius: "8px", padding: "0.9rem", marginBottom: "0.65rem", borderLeft: `2px solid ${col}30` }}>
                              <div style={{ color: "#2a6a4a", fontSize: "0.66rem", letterSpacing: "0.14em", marginBottom: "0.4rem" }}>📖 WHAT THIS MEANS (PLAIN ENGLISH)</div>
                              <div style={{ color: "#9ab8a8", fontSize: "0.82rem", lineHeight: "1.7" }}>{item.deepDive}</div>
                            </div>

                            {/* Felix Relevance — the KEY section */}
                            <div style={{ background: col + "0a", border: `1px solid ${col}25`, borderRadius: "8px", padding: "0.9rem", marginBottom: "0.65rem" }}>
                              <div style={{ color: col, fontSize: "0.66rem", letterSpacing: "0.14em", marginBottom: "0.4rem" }}>🎯 FÉLIX, THIS MATTERS TO YOU BECAUSE...</div>
                              <div style={{ color: "#c0d8c8", fontSize: "0.82rem", lineHeight: "1.7" }}>{item.felixRelevance}</div>
                            </div>

                            {/* Strategic Take */}
                            <div style={{ background: "#060d09", borderRadius: "8px", padding: "0.9rem", marginBottom: "0.65rem" }}>
                              <div style={{ color: "#4a8a64", fontSize: "0.66rem", letterSpacing: "0.14em", marginBottom: "0.4rem" }}>⚡ STRATEGIC NEXT STEP</div>
                              <div style={{ color: "#9ab8a8", fontSize: "0.82rem", lineHeight: "1.7" }}>{item.strategicTake}</div>
                            </div>

                            <button onClick={e => { e.stopPropagation(); speak(`${item.headline}. ${item.deepDive} Why this matters to you: ${item.felixRelevance}`); }}
                              style={{ background: "transparent", border: `1px solid ${col}40`, color: col, padding: "0.35rem 0.9rem", borderRadius: "50px", fontSize: "0.72rem", cursor: "pointer" }}>
                              🔊 Read Aloud
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ══ CHAT Q&A SECTION ══════════════════════════════════════════ */}
            <div style={{ background: "#06100C", border: "1px solid #0d2018", borderRadius: "14px", overflow: "hidden", marginBottom: "1.5rem" }}>
              <div style={{ background: "#060e09", padding: "0.9rem 1.25rem", borderBottom: "1px solid #0d2018", display: "flex", gap: "0.6rem", alignItems: "center" }}>
                <span>💬</span>
                <div>
                  <div style={{ color: "#00FFD1", fontSize: "0.75rem", letterSpacing: "0.12em" }}>ASK ME ANYTHING ABOUT THIS BRIEFING</div>
                  <div style={{ color: "#1a4a30", fontSize: "0.68rem" }}>Try: "What is a BCI?" · "Should I contact this company?" · "Explain this funding round simply"</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ padding: "1rem", minHeight: "120px", maxHeight: "280px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {chatMessages.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      background: m.role === "user" ? "#0a2018" : "#060e09",
                      border: `1px solid ${m.role === "user" ? "#00FFD130" : "#0d2018"}`,
                      borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                      padding: "0.65rem 0.9rem", maxWidth: "80%",
                      fontSize: "0.82rem", color: m.role === "user" ? "#c0e8d0" : "#9ab8a8",
                      lineHeight: "1.65"
                    }}>{m.content}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: "flex", gap: "0.3rem", padding: "0.5rem" }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00FFD1", animation: `shimmer 1.2s infinite ${i * 0.2}s` }} />)}
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid #0d2018", display: "flex", gap: "0.5rem" }}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChat()}
                  placeholder="Ask anything about this briefing..."
                  style={{ flex: 1, background: "#0a1810", border: "1px solid #0d2018", color: "#c0d0c8", padding: "0.5rem 0.9rem", borderRadius: "8px", fontSize: "0.82rem", outline: "none" }}
                />
                <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} style={{ background: "#00FFD1", color: "#050A0E", border: "none", padding: "0.5rem 1.1rem", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}>
                  Send
                </button>
              </div>
            </div>

            {/* Footer */}
            <div style={{ paddingTop: "1rem", borderTop: "1px solid #0d2018", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
              <div style={{ color: "#0d2018", fontSize: "0.68rem", letterSpacing: "0.1em" }}>NEURO-INTEL v2 · DR. FÉLIX RIVERA, MD · CONFIDENTIAL</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => setCarMode(true)} style={{ background: "transparent", border: "1px solid #0d2018", color: "#1a3a2a", padding: "0.3rem 0.8rem", borderRadius: "50px", fontSize: "0.7rem", cursor: "pointer" }}>🚗 Car Mode</button>
                <button onClick={generateBriefing} style={{ background: "transparent", border: "1px solid #0d2018", color: "#1a3a2a", padding: "0.3rem 0.8rem", borderRadius: "50px", fontSize: "0.7rem", cursor: "pointer" }}>↻ Refresh</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
