UX things I would improve from that portal
Auto save each step
Next / Back buttons
Input masking for SSN and phone
Mobile spacing
Progress bar highlight

Important thing for your system
When user submits:
Form →
Save full data (including phone/email) →
Generate PDF →
Remove phone + email from PDF →
Email PDF.


The UI (based on the portal you showed)
Top progress bar:
Business Info  →  Owner Info  →  Partner Info  →  Signature
The form sits inside a center card like the example you sent.
Desktop:
[ field ]      [ field ]
[ field ]      [ field ]
Mobile:
[ field ]
[ field ]
[ field ]
Tailwind handles this easily.


Data flow
User fills form
↓
React sends JSON to API
POST /api/applications
↓
Backend saves everything in MongoDB
↓
Backend generates PDF
↓
Backend removes:
email
phone
from PDF data
↓
PDF sent via email
↓
User sees:
Application submitted successfully


Database structure
Application
{
  businessInfo: {},
  ownerInfo: {},
  partnerInfo: {},
  signature: {},

  email: "",
  phone: "",

  createdAt: Date
}
Remember:
Database stores everything
PDF removes email + phone


Responsive design rule
Tailwind:
grid grid-cols-1 md:grid-cols-2 gap-4
This means:
Phone → 1 column
Desktop → 2 columns
No layout breaking.

Signature
Use a library:
react-signature-canvas
Very clean.
Users draw signature with finger on phone.


PDF generation
Use Puppeteer.
Workflow:
Create HTML template
Inject form data
Generate PDF
Attach to email


Email automation
Using Nodemailer:
to: company@email.com
subject: New Funding Application
attachment: application.pdf
Later they can add routing to different employees.



##One thing I recommend adding (this impresses clients)
After submission show:
Application Submitted

Our team will review your funding request shortly.

Email automation
Send two emails automatically.
1. Internal email (to Seacap team)
Subject: New Funding Application
Attachment: generated PDF
Contains the full application record ID
PDF excludes email and phone if that rule is required
2. Confirmation email (to the applicant)
Subject: We received your application
Message confirming submission
Optional note about next steps or response time


Visual style to match their brand
From the screenshot their design uses:
Background
#F7F7F7
Primary color
#5F7D79
Text
#1F1F1F
Buttons should match their brand:
background: #5F7D79
color: white
border-radius: 6px
That way the portal looks like part of their site.


Mobile behavior (very important)
On phone the form becomes:
[ field ]
[ field ]
[ field ]
Not side-by-side.
This is done with:
grid grid-cols-1 md:grid-cols-2


Now the 3 things that will make your portal look like a real fintech product
1. Clean progress stepper
Not just text. Use a proper step indicator.
Example structure:
● Business Info  →  ● Owner  →  ● Partner  →  ● Signature
Active step highlighted in their brand green.
This instantly makes it feel like a real application system.
2. Form card layout
Never stretch the form across the whole page.
Center it like this:
[      HEADER      ]

        Form Title

     ┌───────────────────┐
     │                   │
     │   Form Fields     │
     │                   │
     └───────────────────┘
Max width:
720px – 800px
That is what Stripe, Shopify, and fintech portals do.


3. Smart input formatting
This impresses clients more than anything.
Phone
Auto format:
(XXX) XXX-XXXX
SSN
Auto mask:
XXX-XX-XXXX
EIN
Auto format:
XX-XXXXXXX
Date
Use a calendar picker.


Bonus thing that will impress them
Add a small line under the submit button:
🔒 Secure • Encrypted • Confidential
Clients love seeing that on financial forms.


One more small feature that makes you look professional
When the user clicks Next Step, show a small animation instead of jumping pages.
Example:
Step slides → next step
It feels like a modern application portal.

Mongodb storage
Username-seacap
Pass-Create_one




import { useState } from "react"
import Stepper from "../components/Stepper"
import BusinessForm from "../components/BusinessForm"
import OwnerForm from "../components/OwnerForm"
import PartnerForm from "../components/PartnerForm"
import SignatureForm from "../components/SignatureForm"
import logo from "../assets/logo.svg"

export default function Application() {

  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    business: {},
    owner: {},
    partner: {},
    signature: {}
  })

  const renderStep = () => {

    if (step === 1)
      return (
        <BusinessForm
          next={() => setStep(2)}
          formData={formData}
          setFormData={setFormData}
        />
      )

    if (step === 2)
      return (
        <OwnerForm
          next={() => setStep(3)}
          back={() => setStep(1)}
          formData={formData}
          setFormData={setFormData}
        />
      )

    if (step === 3)
      return (
        <PartnerForm
          next={() => setStep(4)}
          back={() => setStep(2)}
          formData={formData}
          setFormData={setFormData}
        />
      )

    if (step === 4)
      return (
        <SignatureForm
          back={() => setStep(3)}
          formData={formData}
          setFormData={setFormData}
        />
      )
  }

  return (

    

      <div className="min-h-screen bg-[#F5F5F5] font-body">

    {/* Top Header */}
  <div className="w-full bg-white border-b border-gray-200">
    <div className="max-w-[1100px] mx-auto flex items-center justify-between px-6 py-4">
      <img src={logo} alt="Seacap Logo" className="h-8" />
      <span className="text-sm text-gray-700">(833) 666-3454</span>
    </div>
  </div>

  {/* Page Container */}
  <div className="max-w-[900px] mx-auto pt-12">

    {/* Title */}
    <div className="text-center mb-10">
      <h1 className="text-[36px] font-heading font-medium text-gray-900">
        Information form
      </h1>

      <p className="text-gray-500 mt-3">
        4 steps to funding. Please complete the information below so we can review your application.
      </p>
    </div>

    {/* Stepper */}
    <Stepper step={step} />

    {/* Form */}
    <div className="bg-white border border-gray-200 rounded-lg p-8 mt-6">
      {renderStep()}
    </div>

  </div>

</div>

    <Stepper step={step} />

    <div className="mt-6">
      {renderStep()}
    </div>

  </div>

</div>
  )


}