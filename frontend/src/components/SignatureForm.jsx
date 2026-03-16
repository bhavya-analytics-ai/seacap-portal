import { useRef, useState, useEffect } from "react"
import { ShieldCheck } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001"

const injectStyles = () => {
  if (document.getElementById("sig-anim-styles")) return
  const style = document.createElement("style")
  style.id = "sig-anim-styles"
  style.textContent = `
    @keyframes spinRing {
      to { transform: rotate(360deg); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      0%   { opacity: 0; transform: scale(0.4); }
      60%  { transform: scale(1.12); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes checkDraw {
      from { stroke-dashoffset: 40; }
      to   { stroke-dashoffset: 0; }
    }
    @keyframes ripple {
      0%   { transform: scale(0.8); opacity: 0.6; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes dotBounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40%           { transform: scale(1);   opacity: 1; }
    }
    .fadeUp-1 { animation: fadeUp 0.5s ease both 0.1s; }
    .fadeUp-2 { animation: fadeUp 0.5s ease both 0.25s; }
    .fadeUp-3 { animation: fadeUp 0.5s ease both 0.4s; }
    .fadeUp-4 { animation: fadeUp 0.5s ease both 0.55s; }
    .fadeUp-5 { animation: fadeUp 0.5s ease both 0.7s; }
    .sig-canvas-wrap { touch-action: none; }
  `
  document.head.appendChild(style)
}

function LoadingScreen() {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "80px 24px", gap: 32, textAlign: "center",
    }}>
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <svg width="80" height="80" style={{ position: "absolute", inset: 0, animation: "spinRing 1.2s linear infinite" }}>
          <circle cx="40" cy="40" r="34" fill="none" stroke="#E8EDEC" strokeWidth="3" />
          <circle cx="40" cy="40" r="34" fill="none" stroke="#195455" strokeWidth="3"
            strokeDasharray="54 160" strokeLinecap="round" />
        </svg>
        <div style={{
          position: "absolute", inset: 10, borderRadius: "50%",
          background: "linear-gradient(135deg, #195455, #0D2223)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(25,84,85,0.3)",
        }}>
          <ShieldCheck size={22} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{
          fontFamily: "'Beliau', serif", fontSize: 26, fontWeight: 400,
          color: "#0D2223", margin: 0, letterSpacing: "-0.01em",
          background: "linear-gradient(90deg, #0D2223 0%, #195455 50%, #0D2223 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shimmer 2s linear infinite",
        }}>
          Submitting your application…
        </p>
        <p style={{ fontFamily: "'Commuters Sans', sans-serif", fontSize: 14, color: "#9EAAA8", margin: 0, fontWeight: 300 }}>
          Please don't close this window
        </p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            backgroundColor: "#195455",
            animation: `dotBounce 1.4s ease-in-out ${i * 0.16}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

function SuccessScreen({ applicationNumber }) {
  useEffect(() => {
    injectStyles()
    localStorage.removeItem("seacap_formData")
    localStorage.removeItem("seacap_step")
  }, [])

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      textAlign: "center", padding: "48px 24px 64px", gap: 0,
    }}>
      <div className="fadeUp-1" style={{ position: "relative", marginBottom: 32 }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "2px solid rgba(25,84,85,0.2)",
            animation: `ripple 2s ease-out ${i * 0.4}s infinite`,
          }} />
        ))}
        <div style={{
          width: 88, height: 88, borderRadius: "50%",
          background: "linear-gradient(145deg, #195455 0%, #0D2223 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 12px 40px rgba(25,84,85,0.35), 0 4px 12px rgba(25,84,85,0.2)",
          animation: "scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
        }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M8 18 L15 25 L28 11" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40"
              style={{ animation: "checkDraw 0.4s ease 0.3s both" }} />
          </svg>
        </div>
      </div>

      <h2 className="fadeUp-2" style={{
        fontFamily: "'Beliau', serif", fontSize: 40, fontWeight: 400,
        color: "#0D2223", margin: "0 0 14px", letterSpacing: "-0.02em", lineHeight: 1.1,
      }}>
        Application Submitted
      </h2>

      {applicationNumber && (
        <div className="fadeUp-3" style={{ fontFamily: "'Commuters Sans', sans-serif", fontSize: 14, color: "#648F89", marginBottom: 10 }}>
          Reference number:{" "}
          <span style={{ fontWeight: 600, color: "#195455" }}>{applicationNumber}</span>
        </div>
      )}

      <p className="fadeUp-3" style={{
        fontFamily: "'Commuters Sans', sans-serif", fontSize: 15, color: "#9EAAA8",
        maxWidth: 360, lineHeight: 1.75, margin: "0 0 32px", fontWeight: 300,
      }}>
        Thank you! Your funding application has been received.
        A Seacap representative will be in touch with you shortly.
      </p>

      <div className="fadeUp-4" style={{ display: "flex", gap: 24, marginBottom: 36 }}>
        {[
          { icon: "📋", label: "Application received" },
          { icon: "🔒", label: "Data secured" },
          { icon: "📞", label: "Team notified" },
        ].map(({ icon, label }) => (
          <div key={label} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            fontFamily: "'Commuters Sans', sans-serif", fontSize: 13, color: "#9EAAA8",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              backgroundColor: "rgba(25,84,85,0.07)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>
              {icon}
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SignaturePad({ label, fieldKey, onSave }) {
  const canvasRef = useRef(null)
  const wrapRef   = useRef(null)
  const drawing   = useRef(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const [saved,   setSaved]   = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ratio  = window.devicePixelRatio || 1
    canvas.width  = canvas.offsetWidth  * ratio
    canvas.height = canvas.offsetHeight * ratio
    const ctx = canvas.getContext("2d")
    ctx.scale(ratio, ratio)
    ctx.strokeStyle = "#0D2223"
    ctx.lineWidth   = 1.8
    ctx.lineCap     = "round"
    ctx.lineJoin    = "round"

    const wrap = wrapRef.current
    const prevent = (e) => e.preventDefault()
    wrap.addEventListener("touchstart", prevent, { passive: false })
    wrap.addEventListener("touchmove",  prevent, { passive: false })
    return () => {
      wrap.removeEventListener("touchstart", prevent)
      wrap.removeEventListener("touchmove",  prevent)
    }
  }, [])

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const src  = e.touches ? e.touches[0] : e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }

  const startDraw = (e) => {
    drawing.current = true
    setSaved(false)
    const ctx = canvasRef.current.getContext("2d")
    const pos = getPos(e, canvasRef.current)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const draw = (e) => {
    if (!drawing.current) return
    const ctx = canvasRef.current.getContext("2d")
    const pos = getPos(e, canvasRef.current)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setIsEmpty(false)
  }

  const stopDraw = () => { drawing.current = false }

  const clear = () => {
    const canvas = canvasRef.current
    const ratio  = window.devicePixelRatio || 1
    canvas.getContext("2d").clearRect(0, 0, canvas.width / ratio, canvas.height / ratio)
    setIsEmpty(true)
    setSaved(false)
    onSave(fieldKey, null)
  }

  const save = () => {
    onSave(fieldKey, canvasRef.current.toDataURL("image/png"))
    setSaved(true)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{
        fontFamily: "'Commuters Sans', sans-serif", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.09em", textTransform: "uppercase", color: "#8A9E9C",
      }}>
        {label}
      </div>
      <div
        ref={wrapRef}
        className="sig-canvas-wrap"
        style={{
          position: "relative",
          border: `1.5px solid ${saved ? "#195455" : "#D8E2E1"}`,
          borderRadius: 8,
          backgroundColor: saved ? "rgba(25,84,85,0.02)" : "#fff",
          overflow: "hidden",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: saved ? "0 0 0 3px rgba(25,84,85,0.08)" : "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <div style={{
          position: "absolute", bottom: 18, left: 16, right: 16,
          height: 1, backgroundColor: "#EEF2F2", pointerEvents: "none",
        }} />
        {isEmpty && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <span style={{
              fontFamily: "'Beliau', serif", fontSize: 16, fontStyle: "italic",
              color: "#C7D8CD", fontWeight: 400,
            }}>Sign here…</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: 110, cursor: "crosshair" }}
          onMouseDown={startDraw} onMouseMove={draw}
          onMouseUp={stopDraw}   onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={clear} style={{
          fontFamily: "'Commuters Sans', sans-serif", fontSize: 12, color: "#B0BBBA",
          background: "none", border: "none", cursor: "pointer", padding: 0,
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#C0392B"}
          onMouseLeave={e => e.currentTarget.style.color = "#B0BBBA"}
        >✕ Clear</button>
        {saved ? (
          <span style={{ fontFamily: "'Commuters Sans', sans-serif", fontSize: 12, color: "#195455", fontWeight: 500 }}>✓ Saved</span>
        ) : (
          <button onClick={save} disabled={isEmpty} style={{
            fontFamily: "'Commuters Sans', sans-serif", fontSize: 12, fontWeight: 500,
            color: isEmpty ? "#C7D8CD" : "#195455",
            background: "none", border: "none",
            cursor: isEmpty ? "not-allowed" : "pointer", padding: 0,
          }}>Save →</button>
        )}
      </div>
    </div>
  )
}

function FloatInput({ label, field, value, onChange, type = "text" }) {
  const hasValue = !!value
  return (
    <div className={`float-field${hasValue ? " floated" : ""}`}>
      <input type={type} placeholder=" " value={value || ""}
        onChange={e => onChange(field, e.target.value)} />
      <label>{label}</label>
    </div>
  )
}

export default function SignatureForm({ back, formData, setFormData, onSubmitted, onSubmitting }) {
  const [submitting,        setSubmitting]        = useState(false)
  const [submitted,         setSubmitted]         = useState(false)
  const [applicationNumber, setApplicationNumber] = useState("")
  const [error,             setError]             = useState("")

  useEffect(() => { injectStyles() }, [])

  useEffect(() => {
    if (!formData.signature?.date) {
      const today = new Date().toISOString().split("T")[0]
      setFormData({ ...formData, signature: { ...formData.signature, date: today } })
    }
  }, [])

  const handleSig = (field, value) => {
    setFormData({ ...formData, signature: { ...formData.signature, [field]: value } })
  }

  const hasPartner = (() => {
    const pct = parseFloat(formData.owner?.ownership)
    return !isNaN(pct) && pct < 51
  })()

  const canSubmit =
    !!formData.signature?.applicant &&
    (!hasPartner || !!formData.signature?.partner) &&
    !!formData.signature?.date

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    if (onSubmitting) onSubmitting()
    setError("")
    try {
      const res = await fetch(`${API_URL}/api/application`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.ok) {
        setApplicationNumber(data.applicationNumber || "")
        setSubmitting(false)
        setSubmitted(true)
        if (onSubmitted) onSubmitted()
      } else {
        if (onSubmitting) onSubmitting(false)
        setSubmitting(false)
        setError(data.error || "Submission failed. Please try again.")
      }
    } catch {
      if (onSubmitting) onSubmitting(false)
      setSubmitting(false)
      setError("Server error. Please try again.")
    }
  }

  if (submitting) return <LoadingScreen />
  if (submitted)  return <SuccessScreen applicationNumber={applicationNumber} />

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      <p style={{
        fontFamily: "'Commuters Sans', sans-serif", fontSize: 14,
        color: "#648F89", lineHeight: 1.7, margin: 0,
        borderLeft: "3px solid #C7D8CD", paddingLeft: 14,
      }}>
        By signing below, you certify that all information provided in this
        application is true and correct to the best of your knowledge.
      </p>

      {hasPartner ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <SignaturePad label="Applicant Signature" fieldKey="applicant" onSave={handleSig} />
          <SignaturePad label="Partner Signature"   fieldKey="partner"   onSave={handleSig} />
        </div>
      ) : (
        <SignaturePad label="Applicant Signature" fieldKey="applicant" onSave={handleSig} />
      )}

      <FloatInput label="Date" field="date"
        value={formData.signature?.date || ""}
        onChange={handleSig} type="date" />

      {error && (
        <p style={{ fontFamily: "'Commuters Sans', sans-serif", fontSize: 13, color: "#C0392B", fontWeight: 500, margin: 0 }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="btn-primary" onClick={handleSubmit}
          disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.45 }}>
          Submit Application →
        </button>
        <button className="btn-secondary" onClick={back}>← Go back</button>
      </div>

    </div>
  )
}