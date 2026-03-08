import { useState } from "react"

function formatPhone(val) {
  const d = val.replace(/\D/g, "").slice(0, 10)
  if (d.length < 4) return d
  if (d.length < 7) return `(${d.slice(0,3)}) ${d.slice(3)}`
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`
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
    if (field === "phone" || field === "fax") val = formatPhone(val)
    onChange(field, val)
    if (touched) setError(validate(val))
  }

  const handleBlur = () => {
    setTouched(true)
    setError(validate(value))
  }

  const hasValue = !!value
  const inputType = field === "phone" || field === "fax" ? "tel" : type

  return (
    <div className={`float-field${error ? " has-error" : ""}${hasValue ? " floated" : ""}`}>
      <input
        type={inputType}
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

function FloatTextarea({ label, field, value, onChange }) {
  const hasValue = !!value
  return (
    <div className={`float-field float-field--textarea${hasValue ? " floated" : ""}`}>
      <textarea
        placeholder=" "
        value={value || ""}
        onChange={e => onChange(field, e.target.value)}
      />
      <label>{label}</label>
    </div>
  )
}

export default function BusinessForm({ next, formData, setFormData }) {

  const handleChange = (field, value) => {
    setFormData({ ...formData, business: { ...formData.business, [field]: value } })
  }

  const b = formData.business || {}
  const agreed = b.agreed || false

  const states = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
    "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
    "VA","WA","WV","WI","WY"
  ]

  const entityOptions   = ["Sole Proprietorship","Partnership","Corporation","LLC","Other"]
  const businessOptions = ["Retail","MO/TO","Wholesale","Restaurant","Supermarket","Other"]

  const sectionLabel = {
    fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
    letterSpacing: "0.09em", textTransform: "uppercase", color: "#8A9E9C", marginBottom: 10,
  }

  const radioLabel = {
    display: "flex", alignItems: "center", gap: 8,
    fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 400,
    color: "#3D5453", cursor: "pointer",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* 2-col grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <FloatInput label="Legal / Corporate Name"    field="businessName"     value={b.businessName}     onChange={handleChange} />
        <FloatInput label="DBA"                       field="dba"              value={b.dba}              onChange={handleChange} />
        <FloatInput label="Physical Address"          field="address"          value={b.address}          onChange={handleChange} />
        <FloatInput label="City"                      field="city"             value={b.city}             onChange={handleChange} />
        <FloatSelect label="State" field="state" value={b.state} onChange={handleChange} options={states} />
        <FloatInput label="ZIP"                       field="zip"              value={b.zip}              onChange={handleChange} type="number" />
        <FloatInput label="Telephone"                 field="phone"            value={b.phone}            onChange={handleChange} />
        <FloatInput label="Fax"                       field="fax"              value={b.fax}              onChange={handleChange} />
        <FloatInput label="Federal Tax ID (EIN)"      field="ein"              value={b.ein}              onChange={handleChange} />
        <FloatInput label="Website"                   field="website"          value={b.website}          onChange={handleChange} />
        <FloatInput label="Date Business Started"     field="startDate"        value={b.startDate}        onChange={handleChange} type="date" />
        <FloatInput label="Length of Ownership"       field="ownershipLength"  value={b.ownershipLength}  onChange={handleChange} />
        <FloatInput label="Email"                     field="email"            value={b.email}            onChange={handleChange} type="email" />
        <FloatInput label="Advance Amount Requested"  field="advanceAmount"    value={b.advanceAmount}    onChange={handleChange} type="number" />
      </div>

      {/* Open Positions — full width */}
      <FloatInput label="Open Positions" field="openPositions" value={b.openPositions} onChange={handleChange} />

      {/* Type of Entity */}
      <div>
        <div style={sectionLabel}>Type of Entity</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px" }}>
          {entityOptions.map(opt => (
            <label key={opt} style={radioLabel}>
              <input type="radio" name="entityType"
                style={{ accentColor: "#195455", width: 16, height: 16, cursor: "pointer" }}
                checked={b.entityType === opt}
                onChange={() => handleChange("entityType", opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Type of Business */}
      <div>
        <div style={sectionLabel}>Type of Business</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px" }}>
          {businessOptions.map(opt => (
            <label key={opt} style={radioLabel}>
              <input type="radio" name="businessType"
                style={{ accentColor: "#195455", width: 16, height: 16, cursor: "pointer" }}
                checked={b.businessType === opt}
                onChange={() => handleChange("businessType", opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Product / Service Sold — compact, same height as other inputs */}
      <FloatTextarea label="Product / Service Sold" field="productService" value={b.productService} onChange={handleChange} />

      {/* Disclaimer */}
      <p style={{
        fontFamily: "'Outfit', sans-serif", fontSize: 13,
        color: "#9EAAA8", lineHeight: 1.65, margin: 0,
      }}>
        By submitting this application you certify that all information provided is true and correct.
      </p>

      {/* Agreement */}
      <label style={{
        display: "flex", alignItems: "flex-start", gap: 10,
        fontFamily: "'Outfit', sans-serif", fontSize: 14,
        color: "#3D5453", cursor: "pointer", lineHeight: 1.55,
      }}>
        <input
          type="checkbox"
          style={{ accentColor: "#195455", width: 17, height: 17, marginTop: 2, cursor: "pointer", flexShrink: 0 }}
          checked={agreed}
          onChange={e => handleChange("agreed", e.target.checked)}
        />
        I agree to the{" "}
        <a href="/terms" style={{ color: "#195455", textDecoration: "underline", textUnderlineOffset: 2 }}>
          terms and conditions
        </a>
      </label>

      {/* Next */}
      <div style={{ paddingTop: 6 }}>
        <button className="btn-primary" onClick={next} disabled={!agreed}>
          Next →
        </button>
      </div>

    </div>
  )
}
