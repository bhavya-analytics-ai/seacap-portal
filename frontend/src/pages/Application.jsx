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

const SLIDE_DURATION = 380

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

  const [submitted,  setSubmitted]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [displayStep, setDisplayStep] = useState(1)
  const [animating,   setAnimating]   = useState(false)
  const [slideClass,  setSlideClass]  = useState("")
  const hasReplayed = useRef(false)

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
          max-width: 1200px; margin: 0 auto; padding: 28px 64px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .app-header-logo { height: 56px; display: block; }
        .app-header-phone {
          font-family: 'Commuters Sans', sans-serif; font-size: 22px; font-weight: 600;
          color: #0D2223; text-decoration: none; letter-spacing: 0.01em;
          transition: color 0.18s; white-space: nowrap;
        }
        .app-header-phone:hover { color: #195455; }
        .app-main { padding: 72px 28px 100px; }
        @media (max-width: 600px) {
          .app-header-inner { padding: 16px 20px; }
          .app-header-logo  { height: 34px; }
          .app-header-phone { font-size: 15px; }
          .app-main { padding: 36px 16px 72px; }
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

      <main className="app-main" style={{ flex: 1, maxWidth: 780, width: "100%", margin: "0 auto" }}>

        {!hideChrome && (
          <>
            <Stepper step={step} />
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <h1 style={{
                fontFamily: "'Beliau', serif", fontSize: 48, fontWeight: 400,
                color: "#0D2223", letterSpacing: "-0.01em", lineHeight: 1.2, margin: 0,
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

      <footer className="app-footer">
        <p>
          By clicking Get Started, you authorize SeacapUSA and prospective third-party funding
          providers to contact you at the numbers you provide (including mobile) during any step
          of this application, via phone (including automated telephone dialing systems,
          prerecorded messages, SMS, and MMS), even if your number is on a Do Not Call Registry.
          You are not required to consent to be contacted in this manner to use SeacapUSA services.
        </p>
        <p style={{ marginBottom: 16, color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          © {new Date().getFullYear()} SeacapUSA. All Rights Reserved.
        </p>
        <div className="footer-links">
          <a href="/terms">Terms and Conditions</a>
          <span className="footer-divider">|</span>
          <a href="/privacy">Privacy</a>
        </div>
      </footer>

    </div>
  )
}