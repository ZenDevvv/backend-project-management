import mongoose, { Document, ObjectId, Schema } from "mongoose";

enum ExpenditureType {
  Opex = "Opex",
  Capex = "Capex",
}

interface ExpenditureBase {
  date: Date;
  type: ExpenditureType;
  estimatedAmount: number;
  actualAmount: number;
  role: string;
}

export interface Opex extends ExpenditureBase {
  type: ExpenditureType.Opex;
  personName: string;
}

export interface Capex extends ExpenditureBase {
  type: ExpenditureType.Capex;
  supplierId?: mongoose.Types.ObjectId;
}

export interface ProjectModel extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  estimatedStartDate: Date;
  estimatedEndDate: Date;
  actualStartDate: Date;
  actualEndDate: Date;
  totalBudget: number;
  forecastedBudget: number;
  opexExpenditures: Opex[];
  capexExpenditures: mongoose.Types.ObjectId[];
  monthlyBreakdown: {
    month: string;
    monthIndex: number;
    year: number;
    budgetedAmount: number;
    actualSpent: number;
  }[];
  projectStatus: {
    status: string;
    date: Date;
  }[];
  projectLeader: mongoose.Types.ObjectId;
  members: {
    userId: mongoose.Types.ObjectId;
    role: string;
  }[];
}

const projectSchema = new Schema<ProjectModel>(
  {
    name: { type: String, required: true, minlength: 1, maxlength: 255 },
    description: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 1000,
    },
    estimatedStartDate: { type: Date, required: true },
    estimatedEndDate: { type: Date, required: true },
    actualStartDate: { type: Date },
    actualEndDate: { type: Date },
    totalBudget: { type: Number, default: 0 },
    forecastedBudget: { type: Number, required: true, default: 0 },
    projectStatus: [
      {
        status: { type: String, required: true },
        date: { type: Date, required: true },
      },
    ],
    opexExpenditures: [
      {
        personName: { type: String, required: true },
        role: { type: String, required: true },
        date: { type: Date, required: true },
        estimatedAmount: { type: Number, required: true },
        actualAmount: { type: Number, required: true },
      },
    ],
    capexExpenditures: [
      {
        type: Schema.Types.ObjectId,
        ref: "Capex", 
      },
    ],
    projectLeader: { type: Schema.Types.ObjectId, ref: "User" },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

projectSchema.index({ name: "text", description: "text" });

export default mongoose.model<ProjectModel>("Project", projectSchema);
