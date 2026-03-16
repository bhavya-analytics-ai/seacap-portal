export default function Stepper({ step }) {
  const steps = ["Business", "Owner", "Partner", "Signature"]

  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 64 }}>
      <style>{`
        .stepper-connector {
          width: 120px;
          height: 2px;
          border-radius: 2px;
          margin-top: 10px;
          margin-left: 10px;
          margin-right: 10px;
          margin-bottom: 28px;
          transition: background-color 0.3s ease;
          flex-shrink: 0;
        }
        .stepper-label {
          font-family: 'Commuters Sans', sans-serif;
          font-size: 14px;
          letter-spacing: 0.02em;
          white-space: nowrap;
          transition: color 0.25s ease;
        }
        @media (max-width: 600px) {
          .stepper-connector { width: 40px !important; margin-left: 4px !important; margin-right: 4px !important; }
          .stepper-label { font-size: 11px !important; }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {steps.map((label, index) => {
          const num         = index + 1
          const isCompleted = step > num
          const isActive    = step === num

          return (
            <div key={label} style={{ display: "flex", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>

                <div style={{
                  width:           isActive ? 22 : isCompleted ? 22 : 14,
                  height:          isActive ? 22 : isCompleted ? 22 : 14,
                  borderRadius:    "50%",
                  backgroundColor: isCompleted || isActive ? "#195455" : "#fff",
                  border:          `2px solid ${isCompleted || isActive ? "#195455" : "#C7D8CD"}`,
                  boxShadow:       isActive ? "0 0 0 7px rgba(25,84,85,0.1)" : "none",
                  transition:      "all 0.25s ease",
                  marginTop:       isActive ? 0 : isCompleted ? 0 : 3,
                  display:         "flex",
                  alignItems:      "center",
                  justifyContent:  "center",
                  flexShrink:      0,
                }}>
                  {isCompleted && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.7"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                <span
                  className="stepper-label"
                  style={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#195455" : isCompleted ? "#648F89" : "#B0BBBA",
                  }}
                >
                  {label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className="stepper-connector"
                  style={{ backgroundColor: step > num ? "#195455" : "#E0E6E5" }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}