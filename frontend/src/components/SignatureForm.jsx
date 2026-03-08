import { useRef, useState, useEffect } from "react"
import { ShieldCheck } from "lucide-react"

/* ── Keyframe styles injected once ── */
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
    .fadeUp-1 { animation: fadeUp 0.5s ease both 0.1s; }
    .fadeUp-2 { animation: fadeUp 0.5s ease both 0.25s; }
    .fadeUp-3 { animation: fadeUp 0.5s ease both 0.4s; }
    .fadeUp-4 { animation: fadeUp 0.5s ease both 0.55s; }
    .fadeUp-5 { animation: fadeUp 0.5s ease both 0.7s; }
  `
  document.head.appendChild(style)
}

/* ── Loading overlay ── */
function LoadingOverlay() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      backgroundColor: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(6px)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 28,
    }}>

      {/* Spinning ring + logo area */}
      <div style={{ position: "relative", width: 90, height: 90 }}>

        {/* Outer spinning ring */}
        <svg
          width="90" height="90"
          style={{ position: "absolute", inset: 0, animation: "spinRing 1.2s linear infinite" }}
        >
          <circle cx="45" cy="45" r="40"
            fill="none" stroke="#E8EDEC" strokeWidth="3" />
          <circle cx="45" cy="45" r="40"
            fill="none" stroke="#195455" strokeWidth="3"
            strokeDasharray="60 192"
            strokeLinecap="round"
          />
        </svg>

        {/* Inner teal circle */}
        <div style={{
          position: "absolute", inset: 12,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #195455, #0D2223)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(25,84,85,0.3)",
        }}>
          <ShieldCheck size={26} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
        </div>

      </div>

      {/* Text */}
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{
          fontFamily: "'Cormorant', serif", fontSize: 24, fontWeight: 600,
          color: "#0D2223", margin: 0, letterSpacing: "-0.01em",
          background: "linear-gradient(90deg, #0D2223 0%, #195455 50%, #0D2223 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shimmer 2s linear infinite",
        }}>
          Submitting your application…
        </p>
        <p style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 13,
          color: "#9EAAA8", margin: 0, fontWeight: 300,
        }}>
          Please don't close this window
        </p>
      </div>

      {/* Animated dots */}
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: "50%",
            backgroundColor: "#195455",
            animation: `ripple 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

    </div>
  )
}

/* ── Success screen ── */
function SuccessScreen() {
  useEffect(() => { injectStyles() }, [])

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      textAlign: "center", padding: "48px 24px 64px", gap: 0,
    }}>

      {/* Animated checkmark */}
      <div className="fadeUp-1" style={{ position: "relative", marginBottom: 32 }}>

        {/* Ripple rings */}
        {[1, 2].map(i => (
          <div key={i} style={{
            position: "absolute", inset: 0,
            borderRadius: "50%",
            border: "2px solid rgba(25,84,85,0.25)",
            animation: `ripple 2s ease-out ${i * 0.4}s infinite`,
          }} />
        ))}

        {/* Main circle */}
        <div style={{
          width: 88, height: 88, borderRadius: "50%",
          background: "linear-gradient(145deg, #195455 0%, #0D2223 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 12px 40px rgba(25,84,85,0.35), 0 4px 12px rgba(25,84,85,0.2)",
          animation: "scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
        }}>
          {/* Animated SVG checkmark */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M8 18 L15 25 L28 11"
              stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="40"
              style={{ animation: "checkDraw 0.4s ease 0.3s both" }}
            />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <h2 className="fadeUp-2" style={{
        fontFamily: "'Cormorant', serif", fontSize: 40, fontWeight: 600,
        color: "#0D2223", margin: "0 0 14px", letterSpacing: "-0.02em", lineHeight: 1.1,
      }}>
        Application Submitted
      </h2>

      {/* Subtext */}
      <p className="fadeUp-3" style={{
        fontFamily: "'Outfit', sans-serif", fontSize: 15,
        color: "#9EAAA8", maxWidth: 360, lineHeight: 1.75,
        margin: "0 0 32px", fontWeight: 300,
      }}>
        Thank you! Your funding application has been received.
        A Seacap representative will be in touch with you shortly.
      </p>

      {/* Details row */}
      <div className="fadeUp-4" style={{
        display: "flex", gap: 24, marginBottom: 36,
        fontFamily: "'Outfit', sans-serif", fontSize: 13,
      }}>
        {[
          { icon: "📋", label: "Application received" },
          { icon: "🔒", label: "Data secured" },
          { icon: "📞", label: "Team notified" },
        ].map(({ icon, label }) => (
          <div key={label} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            color: "#9EAAA8",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              backgroundColor: "rgba(25,84,85,0.07)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>
              {icon}
            </div>
            <span style={{ fontWeight: 400 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Trust badge */}
      <div className="fadeUp-5" style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "10px 20px",
        backgroundColor: "rgba(25,84,85,0.06)",
        border: "1px solid rgba(25,84,85,0.12)",
        borderRadius: 100,
      }}>
        <ShieldCheck size={14} strokeWidth={2} color="#195455" />
        <span style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 12.5,
          fontWeight: 500, color: "#195455",
        }}>
          Safe, Secure &amp; Confidential
        </span>
      </div>

    </div>
  )
}

/* ── Signature pad ── */
function SignaturePad({ label, fieldKey, onSave }) {
  const canvasRef = useRef(null)
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
  }, [])

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const src  = e.touches ? e.touches[0] : e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }

  const startDraw = (e) => {
    e.preventDefault()
    drawing.current = true
    setSaved(false)
    const ctx = canvasRef.current.getContext("2d")
    const pos = getPos(e, canvasRef.current)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const draw = (e) => {
    e.preventDefault()
    if (!drawing.current) return
    const ctx = canvasRef.current.getContext("2d")
    const pos = getPos(e, canvasRef.current)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    setIsEmpty(false)
  }

  const stopDraw = (e) => {
    e.preventDefault()
    drawing.current = false
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ratio  = window.devicePixelRatio || 1
    const ctx    = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width / ratio, canvas.height / ratio)
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
        fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.09em", textTransform: "uppercase", color: "#8A9E9C",
      }}>
        {label}
      </div>

      <div style={{
        position: "relative",
        border: `1.5px solid ${saved ? "#195455" : "#D8E2E1"}`,
        borderRadius: 8,
        backgroundColor: saved ? "rgba(25,84,85,0.02)" : "#fff",
        overflow: "hidden",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: saved ? "0 0 0 3px rgba(25,84,85,0.08)" : "none",
      }}>
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
              fontFamily: "'Cormorant', serif", fontSize: 16, fontStyle: "italic",
              color: "#C7D8CD", fontWeight: 400,
            }}>Sign here…</span>
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{ display: "block", width: "100%", height: 88, cursor: "crosshair" }}
          onMouseDown={startDraw} onMouseMove={draw}
          onMouseUp={stopDraw}   onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={clear} style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#B0BBBA",
          background: "none", border: "none", cursor: "pointer", padding: 0,
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#C0392B"}
          onMouseLeave={e => e.currentTarget.style.color = "#B0BBBA"}
        >✕ Clear</button>
        {saved ? (
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "#195455", fontWeight: 500 }}>
            ✓ Saved
          </span>
        ) : (
          <button onClick={save} disabled={isEmpty} style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 500,
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

/* ── Main component ── */
export default function SignatureForm({ back, formData, setFormData }) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [error,      setError]      = useState("")

  useEffect(() => { injectStyles() }, [])

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
    setError("")
    try {
      const res  = await fetch("http://localhost:5001/api/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.ok) {
        setSubmitted(true)
      } else {
        setError("Submission failed. Please try again.")
      }
    } catch {
      setError("Server error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitting) return <LoadingOverlay />
  if (submitted)  return <SuccessScreen />

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      <p style={{
        fontFamily: "'Outfit', sans-serif", fontSize: 14,
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

      <FloatInput
        label="Date" field="date"
        value={formData.signature?.date || ""}
        onChange={handleSig} type="date"
      />

      {error && (
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#C0392B", fontWeight: 500, margin: 0 }}>
          {error}
        </p>
      )}

      {/* Trust badge */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "12px 16px",
        backgroundColor: "rgba(25,84,85,0.05)",
        border: "1px solid rgba(25,84,85,0.12)",
        borderRadius: 8,
      }}>
        <ShieldCheck size={15} strokeWidth={2} color="#195455" />
        <span style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 13,
          fontWeight: 500, color: "#195455",
        }}>
          Safe, Secure &amp; Confidential — Your data is encrypted and protected
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{ opacity: canSubmit ? 1 : 0.45 }}
        >
          Submit Application →
        </button>
        <button className="btn-secondary" onClick={back}>
          ← Go back
        </button>
      </div>

    </div>
  )
}
