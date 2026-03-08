import { useState } from "react"

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

function FloatInput({ label, field, value, onChange, type = "text" }) {
  const [touched, setTouched] = useState(false)
  const [error, setError]     = useState("")

  const validate = (val) => {
    if (type === "email" && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
      return "Please enter a valid email address."
    return ""
  }

  const handleChange = (e) => {
    let val = e.target.value
    if (field === "cell" || field === "home") val = formatPhone(val)
    if (field === "ssn") val = formatSSN(val)
    onChange(field, val)
    if (touched) setError(validate(val))
  }

  const handleBlur = () => {
    setTouched(true)
    setError(validate(value))
  }

  const hasValue = !!value

  return (
    <div className={`float-field${error ? " has-error" : ""}${hasValue ? " floated" : ""}`}>
      <input
        type={type}
        placeholder=" "
        value={value || ""}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <label>{label}</label>
      {error && <div className="error-msg">{error}</div>}
    </div>
  )
}

function FloatSelect({ label, field, value, onChange, options }) {
  const hasValue = !!value
  return (
    <div className={`float-field${hasValue ? " floated" : ""}`} style={{ position: "relative" }}>
      <select
        className={hasValue ? "has-value" : ""}
        value={value || ""}
        onChange={e => onChange(field, e.target.value)}
        style={{ paddingRight: 36, cursor: "pointer" }}
      >
        <option value="" disabled hidden />
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <label>{label}</label>
      <span style={{
        position: "absolute", right: 14, top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none", color: "#8A9E9C", fontSize: 12,
      }}>▾</span>
    </div>
  )
}

export default function OwnerForm({ next, back, formData, setFormData }) {

  const handleChange = (field, value) => {
    setFormData({ ...formData, owner: { ...formData.owner, [field]: value } })
  }

  const o = formData.owner || {}

  // Ownership % logic — if < 51 go to Partner, else skip to Signature
  const handleNext = () => {
    const pct = parseFloat(o.ownership)
    if (!isNaN(pct) && pct < 51) {
      next("partner")   // caller uses this to go to step 3
    } else {
      next("signature") // caller uses this to skip to step 4
    }
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

  // Ownership % hint
  const ownershipPct = parseFloat(o.ownership)
  const showPartnerHint = !isNaN(ownershipPct) && ownershipPct < 51

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* 2-col grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        <FloatInput
          label="Corporate Officer / Owner Name"
          field="name" value={o.name} onChange={handleChange}
        />
        <FloatSelect
          label="Title"
          field="title" value={o.title} onChange={handleChange}
          options={titleOptions}
        />

        {/* Ownership % — with inline hint */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <FloatInput
            label="Ownership %"
            field="ownership" value={o.ownership} onChange={handleChange}
            type="number"
          />
          {showPartnerHint && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "'Outfit', sans-serif", fontSize: 12.5,
              color: "#195455", fontWeight: 500,
            }}>
              <span style={{ fontSize: 14 }}>ℹ️</span>
              Under 51% — partner information will be required.
            </div>
          )}
        </div>

        <FloatSelect
          label="FICO Score"
          field="fico" value={o.fico} onChange={handleChange}
          options={ficoOptions}
        />

        <FloatInput label="Home Address"  field="address" value={o.address} onChange={handleChange} />
        <FloatInput label="City"          field="city"    value={o.city}    onChange={handleChange} />

        <FloatSelect
          label="State"
          field="state" value={o.state} onChange={handleChange}
          options={states}
        />

        <FloatInput label="ZIP"           field="zip"  value={o.zip}  onChange={handleChange} type="number" />
        <FloatInput label="SSN"           field="ssn"  value={o.ssn}  onChange={handleChange} />
        <FloatInput label="Date of Birth" field="dob"  value={o.dob}  onChange={handleChange} type="date" />
        <FloatInput label="Cell"          field="cell" value={o.cell} onChange={handleChange} />
        <FloatInput label="Home Phone"    field="home" value={o.home} onChange={handleChange} />

      </div>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
        <button className="btn-primary" onClick={handleNext}>
          {showPartnerHint ? "Next — Add Partner →" : "Next →"}
        </button>
        <button className="btn-secondary" onClick={back}>
          ← Go back
        </button>
      </div>

    </div>
  )
}
