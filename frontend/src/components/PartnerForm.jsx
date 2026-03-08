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
  const hasValue = !!value

  const handleChange = (e) => {
    let val = e.target.value
    if (field === "cellPhone" || field === "homePhone") val = formatPhone(val)
    if (field === "ssn") val = formatSSN(val)
    onChange(field, val)
  }

  return (
    <div className={`float-field${hasValue ? " floated" : ""}`}>
      <input
        type={type}
        placeholder=" "
        value={value || ""}
        onChange={handleChange}
      />
      <label>{label}</label>
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

export default function PartnerForm({ next, back, formData, setFormData }) {

  const handleChange = (field, value) => {
    setFormData({ ...formData, partner: { ...formData.partner, [field]: value } })
  }

  const p = formData.partner || {}

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        <FloatInput  label="Partner Name"   field="name"      value={p.name}      onChange={handleChange} />
        <FloatSelect label="Title"          field="title"     value={p.title}     onChange={handleChange} options={titleOptions} />
        <FloatInput  label="Ownership %"    field="ownership" value={p.ownership} onChange={handleChange} type="number" />
        <FloatSelect label="FICO Score"     field="fico"      value={p.fico}      onChange={handleChange} options={ficoOptions} />
        <FloatInput  label="Home Address"   field="address"   value={p.address}   onChange={handleChange} />
        <FloatInput  label="City"           field="city"      value={p.city}      onChange={handleChange} />
        <FloatSelect label="State"          field="state"     value={p.state}     onChange={handleChange} options={states} />
        <FloatInput  label="ZIP Code"       field="zip"       value={p.zip}       onChange={handleChange} type="number" />
        <FloatInput  label="SSN"            field="ssn"       value={p.ssn}       onChange={handleChange} />
        <FloatInput  label="Date of Birth"  field="dob"       value={p.dob}       onChange={handleChange} type="date" />
        <FloatInput  label="Home Phone"     field="homePhone" value={p.homePhone} onChange={handleChange} />
        <FloatInput  label="Cell Phone"     field="cellPhone" value={p.cellPhone} onChange={handleChange} />

      </div>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
        <button className="btn-primary" onClick={next}>
          Next →
        </button>
        <button className="btn-secondary" onClick={back}>
          ← Go back
        </button>
      </div>

    </div>
  )
}
