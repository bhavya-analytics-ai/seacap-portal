import { useState, useEffect, useRef } from "react"
import { ShieldCheck } from "lucide-react"
import Stepper from "../components/Stepper"
import BusinessForm from "../components/BusinessForm"
import OwnerForm from "../components/OwnerForm"
import PartnerForm from "../components/PartnerForm"
import SignatureForm from "../components/SignatureForm"
import logo from "../assets/logo.svg"

const stepHeadings = {
  1: "Tell us about your business",
  2: "Tell us about the owner",
  3: "Partner information",
  4: "Sign & submit your application",
}


// ─────────────────────────────────────────────────────────────────
// PROGRESS ORB — HOW TO UPDATE
// ─────────────────────────────────────────────────────────────────
// The orb tracks how many fields are filled per step.
// Field lists are defined at the top of this function.
//
// TO ADD A FIELD:
//   Add the field key to the relevant array below.
//   Example: const BUSINESS_FIELDS = [..., "newField"]
//
// TO REMOVE A FIELD:
//   Delete it from the array. Percentage recalculates automatically.
//
// TO CHANGE STEP PERCENTAGES:
//   Step 1 → maxes at 25%
//   Step 2 → maxes at 50% (or 67% if ownership >= 51%)
//   Step 3 → maxes at 75% (partner step)
//   Step 4 → goes to 100%
//   Find the if(step === X) blocks and update the numbers.
//
// FIELD KEYS must match exactly what's used in handleChange() in each form.
// If you rename a field in the form, rename it here too.
// ─────────────────────────────────────────────────────────────────

const SLIDE_DURATION = 380

function ProgressOrb({ step, hasPartner, formData }) {

  const BUSINESS_FIELDS = ["businessName","dba","address","city","state","zip","phone","ein","startDate","ownershipLength","email","productService","advanceAmount"]
  const OWNER_FIELDS    = ["name","title","ownership","fico","address","city","state","zip","ssn","dob","cell"]
  const PARTNER_FIELDS  = ["name","title","ownership","fico","address","city","state","zip","ssn","dob","cellPhone"]
  const SIG_FIELDS      = ["applicant"]

  const countFilled = (obj, fields) => {
    if (!obj) return 0
    return fields.filter(f => {
      const v = obj[f]
      return v !== undefined && v !== null && String(v).trim() !== "" && v !== false
    }).length
  }

  const ownership = parseFloat(formData?.owner?.ownership)
  const ownershipOver51 = !isNaN(ownership) && ownership >= 51

  const businessFilled  = countFilled(formData?.business, BUSINESS_FIELDS)
  const businessTotal   = BUSINESS_FIELDS.length
  const ownerFilled     = countFilled(formData?.owner, OWNER_FIELDS)
  const ownerTotal      = OWNER_FIELDS.length
  const partnerFilled   = countFilled(formData?.partner, PARTNER_FIELDS)
  const partnerTotal    = PARTNER_FIELDS.length
  const sigFilled       = countFilled(formData?.signature, SIG_FIELDS)
  const sigTotal        = SIG_FIELDS.length

  let pct = 0

  if (step === 1) {
    pct = Math.round((businessFilled / businessTotal) * 25)
  } else if (step === 2) {
    const ownerProgress = Math.round((ownerFilled / ownerTotal) * 25)
    const page2Max = ownershipOver51 ? 42 : 25
    pct = 25 + Math.round((ownerFilled / ownerTotal) * page2Max)
  } else if (step === 3) {
    pct = 50 + Math.round((partnerFilled / partnerTotal) * 25)
  } else if (step === 4) {
    const base = hasPartner ? 75 : 67
    pct = base + Math.round((sigFilled / sigTotal) * (100 - base))
  }

  pct = Math.min(100, Math.max(0, pct))

  const r = 28
  const circumference = 2 * Math.PI * r
  const offset = circumference - (pct / 100) * circumference
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 999,
      filter: "drop-shadow(0 4px 16px rgba(13,34,35,0.4))",
    }}>
      <style>{`
        @keyframes orb-spin { from{transform:rotate(0deg) translateX(28px) rotate(0deg)} to{transform:rotate(360deg) translateX(28px) rotate(-360deg)} }
        @keyframes orb-spin-rev { from{transform:rotate(0deg) translateX(28px) rotate(0deg)} to{transform:rotate(-360deg) translateX(28px) rotate(360deg)} }
        @keyframes orb-breathe { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .orb-dot1 { animation: orb-spin 3.5s linear infinite; }
        .orb-dot2 { animation: orb-spin-rev 5s linear infinite; animation-delay: -1s; }
        .orb-dot3 { animation: orb-breathe 2s ease-in-out infinite; }
        .progress-ring { transition: stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1); }
      `}</style>
      <svg width="76" height="76" viewBox="0 0 76 76" style={{ overflow: "visible" }}>
        <circle cx="38" cy="38" r="36" fill="#0D2223" />
        <circle cx="38" cy="38" r="28" fill="none" stroke="rgba(100,143,137,0.12)" strokeWidth="1.5" strokeDasharray="3 4" />
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        <circle
          className="progress-ring"
          cx="38" cy="38" r={r}
          fill="none" stroke="#648F89" strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 38 38)"
        />
        <circle cx="38" cy="38" r="16" fill="#195455" />
        <text x="38" y="42" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600" fontFamily="'Commuters Sans', sans-serif">{pct}%</text>
        <g transform="translate(38,38)">
          <circle className="orb-dot1" cx="0" cy="0" r="3.5" fill="#C7D8CD" />
        </g>
        <g transform="translate(38,38)">
          <circle className="orb-dot2" cx="0" cy="0" r="2" fill="#648F89" />
        </g>
        <g transform="translate(38,38)">
          <circle className="orb-dot3" cx="0" cy="0" r="1.5" fill="rgba(199,216,205,0.6)" />
        </g>
      </svg>
    </div>
  )
}

export default function Application() {

  const [step, setStep] = useState(() => {
    try { const s = localStorage.getItem("seacap_step"); return s ? parseInt(s) : 1 }
    catch { return 1 }
  })

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem("seacap_formData")
      return saved ? JSON.parse(saved) : { business: {}, owner: {}, partner: {}, signature: {} }
    } catch { return { business: {}, owner: {}, partner: {}, signature: {} } }
  })

  const [submitted,   setSubmitted]   = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [displayStep, setDisplayStep] = useState(1)
  const [animating,   setAnimating]   = useState(false)
  const [slideClass,  setSlideClass]  = useState("")
  const hasReplayed = useRef(false)

  const hasPartner = (() => {
    const pct = parseFloat(formData.owner?.ownership)
    return !isNaN(pct) && pct < 51
  })()

  useEffect(() => {
    localStorage.setItem("seacap_formData", JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    localStorage.setItem("seacap_step", step)
  }, [step])

  useEffect(() => {
    if (hasReplayed.current) return
    hasReplayed.current = true
    const savedStep = step
    if (savedStep <= 1) { setDisplayStep(1); return }
    let current = 1
    const replay = () => {
      if (current >= savedStep) return
      current++
      setSlideClass("slide-exit-left")
      setTimeout(() => {
        setDisplayStep(current)
        setSlideClass("slide-enter-right")
        setTimeout(() => {
          setSlideClass("")
          if (current < savedStep) replay()
        }, current < savedStep ? 120 : SLIDE_DURATION)
      }, current < savedStep ? 60 : SLIDE_DURATION / 2)
    }
    setTimeout(replay, 200)
  }, [])

  const goToStep = (newStep) => {
    if (animating) return
    const forward = newStep > step
    setAnimating(true)
    setStep(newStep)
    const exitClass  = forward ? "slide-exit-left"  : "slide-exit-right"
    const enterClass = forward ? "slide-enter-right" : "slide-enter-left"
    setSlideClass(exitClass)
    setTimeout(() => {
      setDisplayStep(newStep)
      setSlideClass(enterClass)
      setTimeout(() => {
        setSlideClass("")
        setAnimating(false)
      }, SLIDE_DURATION)
    }, SLIDE_DURATION / 2)
  }

  const handleOwnerNext = (destination) => {
    goToStep(destination === "partner" ? 3 : 4)
  }

  const renderStep = (s) => {
    if (s === 1) return <BusinessForm next={() => goToStep(2)} formData={formData} setFormData={setFormData} />
    if (s === 2) return <OwnerForm next={handleOwnerNext} back={() => goToStep(1)} formData={formData} setFormData={setFormData} />
    if (s === 3) return <PartnerForm next={() => goToStep(4)} back={() => goToStep(2)} formData={formData} setFormData={setFormData} />
    if (s === 4) return (
      <SignatureForm
        back={() => {
          const pct = parseFloat(formData.owner?.ownership)
          goToStep(!isNaN(pct) && pct < 51 ? 3 : 2)
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmitting={() => setSubmitting(true)}
        onSubmitted={() => { setSubmitting(false); setSubmitted(true) }}
      />
    )
    return null
  }

  const hideChrome = submitting || submitted

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>

      <style>{`
        .step-wrapper { overflow: visible; }
        .step-content {
          transition: transform ${SLIDE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1),
                      opacity ${SLIDE_DURATION}ms ease;
          will-change: transform, opacity;
        }
        .slide-exit-left, .slide-exit-right {
          transition: transform ${SLIDE_DURATION / 2}ms cubic-bezier(0.4, 0, 0.2, 1),
                      opacity ${SLIDE_DURATION / 2}ms ease;
        }
        .slide-exit-left   { transform: translateX(-48px); opacity: 0; }
        .slide-exit-right  { transform: translateX(48px);  opacity: 0; }
        .slide-enter-right { transform: translateX(48px);  opacity: 0; }
        .slide-enter-left  { transform: translateX(-48px); opacity: 0; }
        .app-header-inner {
          max-width: 1700px; margin: 0 auto; padding: 28px 66px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .app-header-logo { height: 52px; display: block; }
        .app-header-phone {
          font-family: 'Commuters Sans', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #0D2223;
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: color 0.18s;
          white-space: nowrap;
        }
        .app-header-phone:hover { color: #195455; }
        .app-main { padding: 64px 28px 560px; }
        @media (max-width: 600px) {
          .app-header-inner { padding: 16px 20px; }
          .app-header-logo  { height: 34px; }
          .app-header-phone { font-size: 20px; }
          .app-main { padding: 36px 16px 120px; }
        }
      `}</style>

      <header style={{ backgroundColor: "#fff", borderBottom: "1.5px solid #E8EDEC" }}>
        <div className="app-header-inner">
          <a href="https://seacapusa.com" target="_blank" rel="noopener noreferrer">
            <img src={logo} alt="Seacap" className="app-header-logo" />
          </a>
          <a href="tel:18336663454" className="app-header-phone">(833) 666-3454</a>
        </div>
      </header>

      <main className="app-main" style={{ flex: 1, maxWidth: 680, width: "100%", margin: "0 auto" }}>

        {!hideChrome && (
          <>
            <Stepper step={step} />
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <h1 style={{
                fontFamily: "'Beliau', serif",
                fontSize: 48,
                fontWeight: 600,
                color: "#0D2223",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
                margin: 0,
              }}>
                {stepHeadings[step]}
              </h1>
            </div>
          </>
        )}

        <div className="step-wrapper">
          <div className={`step-content ${slideClass}`}>
            {renderStep(displayStep)}
          </div>
        </div>

        {!hideChrome && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 7, marginTop: 32,
            fontFamily: "'Commuters Sans', sans-serif", fontSize: 14, color: "#B0BBBA",
          }}>
            <ShieldCheck size={15} strokeWidth={1.8} color="#B0BBBA" />
            <span>Safe, Secure &amp; Confidential</span>
          </div>
        )}
      </main>

      {!hideChrome && <ProgressOrb step={step} hasPartner={hasPartner} />}

      <footer className="app-footer">
        <p style={{ fontWeight: 500 }}>
          By clicking Get Started, you authorize SeacapUSA and prospective third-party funding providers to contact you at the numbers you provide (including mobile) during any step of this application, via phone (including automated telephone dialing systems, prerecorded messages, SMS, and MMS), even if your number is on a Do Not Call Registry. You are not required to consent to be contacted in this manner to use SeacapUSA services.
        </p>
        <p style={{ marginBottom: 6, color: "rgba(255,255,255,0.4)", fontSize: 18, fontWeight: 600 }}>
          © 2024 SeacapUSA. All Rights Reserved.
        </p>
        <div className="footer-links" style={{ fontWeight: 600, fontSize: 18 }}>
          <a href="https://seacapusa.com/terms-and-conditions/" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
          <span className="footer-divider">|</span>
          <a href="https://seacapusa.com/privacy-policy/" target="_blank" rel="noopener noreferrer">Privacy</a>
        </div>
      </footer>

    </div>
  )
}
