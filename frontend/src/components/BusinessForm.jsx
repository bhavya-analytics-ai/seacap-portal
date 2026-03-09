import { useState } from "react"

const REQUIRED = [
  
]

function formatPhone(val) {
  const d = val.replace(/\D/g, "").slice(0, 10)
  if (d.length < 4) return d
  if (d.length < 7) return `(${d.slice(0,3)}) ${d.slice(3)}`
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
}

function validateField(field, value) {
  if (REQUIRED.includes(field) && !String(value || "").trim()) return "This field is required."
  if (field === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address."
  if ((field === "phone" || field === "fax") && value) {
    const digits = value.replace(/\D/g, "")
    if (digits.length > 0 && digits.length !== 10) return "Phone number must be 10 digits."
  }
  if (field === "zip" && value && !/^\d{5}$/.test(value)) return "ZIP code must be 5 digits."
  if (field === "ein" && value) {
    const digits = value.replace(/\D/g, "")
    if (digits.length > 0 && digits.length !== 9) return "EIN must be 9 digits."
  }
  return ""
}

function FloatInput({ label, field, value, onChange, type = "text", required = false, submitAttempted = false }) {
  const [touched, setTouched] = useState(false)
  const error = (touched || submitAttempted) ? validateField(field, value) : ""
  const hasValue = !!value
  const inputType = (field === "phone" || field === "fax") ? "tel" : type

  const handleChange = (e) => {
    let val = e.target.value
    if (field === "phone" || field === "fax") val = formatPhone(val)
    if (field === "zip") val = val.replace(/\D/g, "").slice(0, 5)
    if (field === "ein") val = val.replace(/\D/g, "").slice(0, 9)
    onChange(field, val)
  }

  return (
    <div className={`float-field${error ? " has-error" : ""}${hasValue ? " floated" : ""}`}>
      <input type={inputType} placeholder=" " value={value || ""}
        onChange={handleChange} onBlur={() => setTouched(true)} />
      <label>{label}{required && <span style={{ color: "#C0392B", marginLeft: 2 }}>*</span>}</label>
      {error && <div className="error-msg">{error}</div>}
    </div>
  )
}

function FloatSelect({ label, field, value, onChange, options, required = false, submitAttempted = false }) {
  const [touched, setTouched] = useState(false)
  const error = (touched || submitAttempted) && REQUIRED.includes(field) && !value ? "This field is required." : ""
  const hasValue = !!value

  return (
    <div className={`float-field${error ? " has-error" : ""}${hasValue ? " floated" : ""}`} style={{ position: "relative" }}>
      <select className={hasValue ? "has-value" : ""} value={value || ""}
        onChange={e => { onChange(field, e.target.value); setTouched(true) }}
        onBlur={() => setTouched(true)} style={{ paddingRight: 36, cursor: "pointer" }}>
        <option value="" disabled hidden />
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <label>{label}{required && <span style={{ color: "#C0392B", marginLeft: 2 }}>*</span>}</label>
      <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#8A9E9C", fontSize: 13 }}>▾</span>
      {error && <div className="error-msg">{error}</div>}
    </div>
  )
}

function FloatTextarea({ label, field, value, onChange, required = false, submitAttempted = false }) {
  const [touched, setTouched] = useState(false)
  const error = (touched || submitAttempted) && REQUIRED.includes(field) && !String(value || "").trim() ? "This field is required." : ""
  const hasValue = !!value

  return (
    <div className={`float-field float-field--textarea${error ? " has-error" : ""}${hasValue ? " floated" : ""}`}>
      <textarea placeholder=" " value={value || ""}
        onChange={e => onChange(field, e.target.value)} onBlur={() => setTouched(true)} />
      <label>{label}{required && <span style={{ color: "#C0392B", marginLeft: 2 }}>*</span>}</label>
      {error && <div className="error-msg">{error}</div>}
    </div>
  )
}

export default function BusinessForm({ next, formData, setFormData }) {
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [smsExpanded, setSmsExpanded] = useState(false)

  const handleChange = (field, value) => {
    setFormData({ ...formData, business: { ...formData.business, [field]: value } })
  }

  const b = formData.business || {}
  if (!b.startDate) handleChange("startDate", "1975-01-01")

  const agreed = b.agreed || false

  const isFormValid = () => {
    for (const field of REQUIRED) {
      if (validateField(field, b[field])) return false
    }
    if (!agreed) return false
    return true
  }

  const handleNext = () => {
    setSubmitAttempted(true)
    if (!isFormValid()) return
    next()
  }

  const states = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"]
  const entityOptions   = ["Sole Proprietorship","Partnership","Corporation","LLC","Other"]
  const businessOptions = ["Retail","MO/TO","Wholesale","Restaurant","Supermarket","Other"]

  const sectionLabel = { fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "#8A9E9C", marginBottom: 10 }
  const radioLabel   = { display: "flex", alignItems: "center", gap: 9, fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 400, color: "#3D5453", cursor: "pointer" }
  const R = true

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <FloatInput label="Legal / Corporate Name"   field="businessName"    value={b.businessName}    onChange={handleChange} required={R} submitAttempted={submitAttempted} />
        <FloatInput label="DBA"                      field="dba"             value={b.dba}             onChange={handleChange} required={R} submitAttempted={submitAttempted} />
        <FloatInput label="Physical Address"         field="address"         value={b.address}         onChange={handleChange} required={R} submitAttempted={submitAttempted} />
        <FloatInput label="City"                     field="city"            value={b.city}            onChange={handleChange} required={R} submitAttempted={submitAttempted} />
        <FloatSelect label="State" field="state" value={b.state} onChange={handleChange} options={states} required={R} submitAttempted={submitAttempted} />
        <FloatInput label="ZIP"                      field="zip"             value={b.zip}             onChange={handleChange} required={R} submitAttempted={submitAttempted} />
        <FloatInput label="Telephone"                field="phone"           value={b.phone}           onChange={handleChange} required={R} submitAttempted={submitAttempted} />
        <FloatInput label="Fax"                      field="fax"             value={b.fax}             onChange={handleChange} />
        <FloatInput label="Federal Tax ID (EIN)"     field="ein"             value={b.ein}             onChange={handleChange} required={R} submitAttempted={submitAttempted} />
        <FloatInput label="Website"                  field="website"         value={b.website}         onChange={handleChange} />
        <FloatInput label="Date Business Started"    field="startDate"       value={b.startDate}       onChange={handleChange} type="date" required={R} submitAttempted={submitAttempted} />
        <FloatInput label="Length of Ownership"      field="ownershipLength" value={b.ownershipLength} onChange={handleChange} required={R} submitAttempted={submitAttempted} />
        <FloatInput label="Email"                    field="email"           value={b.email}           onChange={handleChange} type="email" required={R} submitAttempted={submitAttempted} />
        <FloatInput label="Advance Amount Requested" field="advanceAmount"   value={b.advanceAmount}   onChange={handleChange} type="number" required={R} submitAttempted={submitAttempted} />
      </div>

      <FloatInput label="Open Positions" field="openPositions" value={b.openPositions} onChange={handleChange} />

      <div>
        <div style={sectionLabel}>Type of Entity</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px" }}>
          {entityOptions.map(opt => (
            <label key={opt} style={radioLabel}>
              <input type="radio" name="entityType" checked={b.entityType === opt} onChange={() => handleChange("entityType", opt)} />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div>
        <div style={sectionLabel}>Type of Business</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px" }}>
          {businessOptions.map(opt => (
            <label key={opt} style={radioLabel}>
              <input type="radio" name="businessType" checked={b.businessType === opt} onChange={() => handleChange("businessType", opt)} />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <FloatTextarea label="Product / Service Sold" field="productService" value={b.productService} onChange={handleChange} required={R} submitAttempted={submitAttempted} />

      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#9EAAA8", lineHeight: 1.65, margin: 0 }}>
        By submitting this application you certify that all information provided is true and correct.
      </p>

      <div style={{ border: "1.5px solid #E0E6E5", borderRadius: 8, padding: "14px 16px", background: "#F7FAFA" }}>
        <button type="button" onClick={() => setSmsExpanded(!smsExpanded)} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", background: "none", border: "none", cursor: "pointer",
          fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500, color: "#195455", padding: 0,
        }}>
          <span>SMS &amp; Text Message Consent</span>
          <span style={{ fontSize: 18, lineHeight: 1, transform: smsExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>⌄</span>
        </button>
        {smsExpanded && (
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "#648F89", lineHeight: 1.7, margin: "12px 0 0" }}>
            By providing your phone number, you agree to receive text messages (e.g., payment reminders)
            from Seacap at the cell number used when signing up. Consent is not a condition of any purchase.
            Reply STOP to unsubscribe, HELP for help. Message &amp; data rates may apply. Message frequency varies.
          </p>
        )}
      </div>

      <label style={{ display: "flex", alignItems: "flex-start", gap: 11, fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "#3D5453", cursor: "pointer", lineHeight: 1.55 }}>
        <input type="checkbox" style={{ marginTop: 2, cursor: "pointer", flexShrink: 0 }}
          checked={agreed} onChange={e => handleChange("agreed", e.target.checked)} />
        I agree to the{" "}
        <a href="/terms" style={{ color: "#195455", textDecoration: "underline", textUnderlineOffset: 2 }}>terms and conditions</a>
      </label>

      {submitAttempted && !isFormValid() && (
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "#C0392B", fontWeight: 500, margin: 0 }}>
          Please fill in all required fields and agree to the terms before continuing.
        </p>
      )}

      <div style={{ paddingTop: 4 }}>
        <button className="btn-primary" onClick={handleNext}>Next →</button>
      </div>

    </div>
  )
}
