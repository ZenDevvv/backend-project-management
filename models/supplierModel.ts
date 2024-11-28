import mongoose, { Document, Schema } from "mongoose";

export interface ISupplier extends Document {
  name: string;
  contactPerson: Schema.Types.ObjectId;
  address: string;
  logo: string;
}

const supplierSchema: Schema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 255,
    },
    contactPerson: [{ type: Schema.Types.ObjectId, ref: "User" }],
    address: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 500,
    },
    logo: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

supplierSchema.index({
  name: "text",
  contactPerson: "text",
  email: "text",
  address: "text",
});

const Supplier = mongoose.model<ISupplier>("Supplier", supplierSchema);

export default Supplier;
