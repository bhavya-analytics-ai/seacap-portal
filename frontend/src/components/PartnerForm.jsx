import { useState } from "react"

const REQUIRED = []

function formatPhone(val) {
  const d = val.replace(/\D/g, "").slice(0, 10)
  if (d.length < 4) return d
  if (d.length < 7) return `(${d.slice(0,3)}) ${d.slice(3)}`
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
}

function formatSSN(val) {
  const d = val.replace(/\D/g, "").slice(0, 9)
  if (d.length < 4) return d
  if (d.length < 6) return `${d.slice(0,3)}-${d.slice(3)}`
  return `${d.slice(0,3)}-${d.slice(3,5)}-${d.slice(5)}`
}

function validateField(field, value) {
  if (REQUIRED.includes(field) && !String(value || "").trim()) {
    return "This field is required."
  }
  if ((field === "cellPhone" || field === "homePhone") && value) {
    const digits = value.replace(/\D/g, "")
    if (digits.length > 0 && digits.length !== 10) return "Must be 10 digits."
  }
  if (field === "ssn" && value) {
    const digits = value.replace(/\D/g, "")
    if (digits.length > 0 && digits.length !== 9) return "SSN must be 9 digits."
  }
  if (field === "zip" && value && !/^\d{5}$/.test(String(value))) {
    return "ZIP must be 5 digits."
  }
  if (field === "ownership" && value) {
    const n = parseFloat(value)
    if (isNaN(n) || n < 1 || n > 100) return "Enter a valid ownership %."
  }
  return ""
}

function FloatInput({ label, field, value, onChange, type = "text", required = false, submitAttempted = false }) {
  const [touched, setTouched] = useState(false)
  const error = (touched || submitAttempted) ? validateField(field, value) : ""
  const hasValue = !!value

  const handleChange = (e) => {
    let val = e.target.value
    if (field === "cellPhone" || field === "homePhone") val = formatPhone(val)
    if (field === "ssn") val = formatSSN(val)
    if (field === "zip") val = val.replace(/\D/g, "").slice(0, 5)
    onChange(field, val)
  }

  return (
    <div className={`float-field${error ? " has-error" : ""}${hasValue ? " floated" : ""}`}>
      <input type={type} placeholder=" " value={value || ""}
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
      <select
        className={hasValue ? "has-value" : ""}
        value={value || ""}
        onChange={e => { onChange(field, e.target.value); setTouched(true) }}
        onBlur={() => setTouched(true)}
        style={{ paddingRight: 36, cursor: "pointer" }}
      >
        <option value="" disabled hidden />
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <label>{label}{required && <span style={{ color: "#C0392B", marginLeft: 2 }}>*</span>}</label>
      <span style={{
        position: "absolute", right: 14, top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none", color: "#8A9E9C", fontSize: 13,
      }}>▾</span>
      {error && <div className="error-msg">{error}</div>}
    </div>
  )
}

export default function PartnerForm({ next, back, formData, setFormData }) {
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const handleChange = (field, value) => {
    setFormData({ ...formData, partner: { ...formData.partner, [field]: value } })
  }

  const p = formData.partner || {}
  if (!p.dob) handleChange("dob", "1975-01-01")

  const isFormValid = () => {
    for (const field of REQUIRED) {
      if (validateField(field, p[field])) return false
    }
    return true
  }

  const handleNext = () => {
    setSubmitAttempted(true)
    if (!isFormValid()) return
    next()
  }

  const titleOptions = [
    "Owner","Founder","Co-Founder","Managing Partner",
    "Principal","Managing Member","Partner",
    "Chief Executive Officer (CEO)","President"
  ]

  const ficoOptions = [
    "700 +","650 – 699","600 – 649","550 – 599",
    "525 – 549","500 – 524","475 – 499","Sub 474"
  ]

  const states = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
    "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
    "VA","WA","WV","WI","WY"
  ]

  const R = true

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <FloatInput  label="Partner Name"  field="name"      value={p.name}      onChange={handleChange} required={R} submitAttempted={submitAttempted} />
        <FloatSelect label="Title"         field="title"     value={p.title}     onChange={handleChange} options={titleOptions} required={R} submitAttempted={submitAttempted} />
        <FloatInput  label="Ownership %"   field="ownership" value={p.ownership} onChange={handleChange} type="number" required={R} submitAttempted={submitAttempted} />
        <FloatSelect label="FICO Score"    field="fico"      value={p.fico}      onChange={handleChange} options={ficoOptions} required={R} submitAttempted={submitAttempted} />
        <FloatInput  label="Home Address"  field="address"   value={p.address}   onChange={handleChange} required={R} submitAttempted={submitAttempted} />
        <FloatInput  label="City"          field="city"      value={p.city}      onChange={handleChange} required={R} submitAttempted={submitAttempted} />
        <FloatSelect label="State"         field="state"     value={p.state}     onChange={handleChange} options={states} required={R} submitAttempted={submitAttempted} />
        <FloatInput  label="ZIP Code"      field="zip"       value={p.zip}       onChange={handleChange} required={R} submitAttempted={submitAttempted} />
        <FloatInput  label="SSN"           field="ssn"       value={p.ssn}       onChange={handleChange} required={R} submitAttempted={submitAttempted} />
        <FloatInput  label="Date of Birth" field="dob"       value={p.dob}       onChange={handleChange} type="date" required={R} submitAttempted={submitAttempted} />
        <FloatInput  label="Cell Phone"    field="cellPhone" value={p.cellPhone} onChange={handleChange} required={R} submitAttempted={submitAttempted} />
        <FloatInput  label="Home Phone"    field="homePhone" value={p.homePhone} onChange={handleChange} />
      </div>

      {submitAttempted && !isFormValid() && (
        <p style={{ fontFamily: "'Commuters Sans', sans-serif", fontSize: 13.5, color: "#C0392B", fontWeight: 500, margin: 0 }}>
          Please fill in all required fields before continuing.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
        <button className="btn-primary" onClick={handleNext}>Next →</button>
        <button className="btn-secondary" onClick={back}>← Go back</button>
      </div>

    </div>
  )
}