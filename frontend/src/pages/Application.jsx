import { useState } from "react"
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

export default function Application() {

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    business: {}, owner: {}, partner: {}, signature: {}
  })

  // OwnerForm passes "partner" or "signature" to decide routing
  const handleOwnerNext = (destination) => {
    if (destination === "partner") {
      setStep(3)
    } else {
      setStep(4) // skip partner if ownership >= 51%
    }
  }

  const renderStep = () => {
    if (step === 1) return (
      <BusinessForm
        next={() => setStep(2)}
        formData={formData}
        setFormData={setFormData}
      />
    )
    if (step === 2) return (
      <OwnerForm
        next={handleOwnerNext}
        back={() => setStep(1)}
        formData={formData}
        setFormData={setFormData}
      />
    )
    if (step === 3) return (
      <PartnerForm
        next={() => setStep(4)}
        back={() => setStep(2)}
        formData={formData}
        setFormData={setFormData}
      />
    )
    if (step === 4) return (
      <SignatureForm
        back={() => {
          // Go back to partner if they went through it, else owner
          const pct = parseFloat(formData.owner?.ownership)
          setStep(!isNaN(pct) && pct < 51 ? 3 : 2)
        }}
        formData={formData}
        setFormData={setFormData}
      />
    )
    return null
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{ backgroundColor: "#fff", borderBottom: "1px solid #E8EDEC" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "16px 40px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <a href="https://seacapusa.com" target="_blank" rel="noopener noreferrer">
            <img src={logo} alt="Seacap" style={{ height: 36, display: "block" }} />
          </a>
          <a
            href="tel:18336663454"
            style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 600,
              color: "#0D2223", textDecoration: "none", transition: "color 0.18s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#195455"}
            onMouseLeave={e => e.currentTarget.style.color = "#0D2223"}
          >
            (833) 666-3454
          </a>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 720, width: "100%", margin: "0 auto", padding: "44px 24px 64px" }}>

        <Stepper step={step} />

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h1 style={{
            fontFamily: "'Cormorant', serif", fontSize: 38, fontWeight: 600,
            color: "#0D2223", letterSpacing: "-0.01em", lineHeight: 1.2, margin: 0,
          }}>
            {stepHeadings[step]}
          </h1>
        </div>

        <div>{renderStep()}</div>

      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          By clicking Get Started, you authorize SeacapUSA and prospective third-party funding
          providers to contact you at the numbers you provide (including mobile) during any step
          of this application, via phone (including automated telephone dialing systems,
          prerecorded messages, SMS, and MMS), even if your number is on a Do Not Call Registry.
          You are not required to consent to be contacted in this manner to use SeacapUSA services.
        </p>
        <p style={{ marginBottom: 16, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          © 2024 SeacapUSA. All Rights Reserved.
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
