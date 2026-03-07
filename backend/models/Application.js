import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    applicationNumber: String,
    business: { type: Object, default: {} },
    owner: { type: Object, default: {} },
    partner: { type: Object, default: {} },
    signature: { type: Object, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model("Application", ApplicationSchema);