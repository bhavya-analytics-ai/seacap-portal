import { ShieldCheck } from "lucide-react"

export default function Stepper({ step }) {
  const steps = ["Business", "Owner", "Partner", "Signature"]

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>

      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {steps.map((label, index) => {
          const num         = index + 1
          const isCompleted = step > num
          const isActive    = step === num

          return (
            <div key={label} style={{ display: "flex", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{
                  width:           isActive ? 14 : 10,
                  height:          isActive ? 14 : 10,
                  borderRadius:    "50%",
                  backgroundColor: isCompleted || isActive ? "#195455" : "#fff",
                  border:          `2px solid ${isCompleted || isActive ? "#195455" : "#C7D8CD"}`,
                  boxShadow:       isActive ? "0 0 0 4px rgba(25,84,85,0.12)" : "none",
                  transition:      "all 0.25s ease",
                  marginTop:       isActive ? 0 : 2,
                }} />
                <span style={{
                  fontFamily:    "'Outfit', sans-serif",
                  fontSize:      13,
                  fontWeight:    isActive ? 600 : 400,
                  color:         isActive ? "#195455" : isCompleted ? "#648F89" : "#B0BBBA",
                  whiteSpace:    "nowrap",
                  transition:    "color 0.25s ease",
                }}>
                  {label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div style={{
                  marginTop: 5, marginLeft: 8, marginRight: 8, marginBottom: 24,
                  width: 100, height: 2, borderRadius: 2,
                  backgroundColor: step > num ? "#195455" : "#E0E6E5",
                  transition: "background-color 0.3s ease",
                }} />
              )}
            </div>
          )
        })}
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 5, marginTop: 18,
        fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "#B0BBBA",
      }}>
        <ShieldCheck size={13} strokeWidth={2} color="#B0BBBA" />
        <span>Safe, Secure &amp; Confidential</span>
      </div>

    </div>
  )
}
