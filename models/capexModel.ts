import mongoose, { Schema, Document } from "mongoose";

export interface capex extends Document {
  type: string;
  description: string;
  supplierId?: mongoose.Types.ObjectId;
  status: string;
  projectId?: mongoose.Types.ObjectId;
  date: Date;
  estimatedAmount: number;
  actualAmount: number;
}

const capexSchema = new Schema<capex>(
  {
    type: { type: String, required: true },
    description: { type: String, required: true, minlength: 1, maxlength: 255 },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: false,
    },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: false },
    status: { type: String, default: "pending" },
    date: { type: Date, required: true },
    estimatedAmount: { type: Number, required: true },
    actualAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

capexSchema.index({ type: "text", description: "text", _id: "text" });
const CapexModel = mongoose.model<capex>("Capex", capexSchema);

export default CapexModel;
