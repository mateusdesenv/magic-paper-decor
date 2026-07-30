import mongoose, { Schema } from "mongoose";

export type ProductInput = {
  name: string;
  category: string;
  price: number;
  image: string;
  tag?: string;
  type: "produto" | "serviço";
  active: boolean;
};

const productSchema = new Schema<ProductInput>({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  tag: { type: String, trim: true, default: "" },
  type: { type: String, enum: ["produto", "serviço"], default: "produto" },
  active: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false });

export const Product = mongoose.models.Product || mongoose.model<ProductInput>("Product", productSchema);
