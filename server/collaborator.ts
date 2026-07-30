import mongoose, { Schema } from "mongoose";

export type CollaboratorStatus = "pending" | "approved" | "blocked";
type CollaboratorInput = {
  uid: string;
  email: string;
  name?: string;
  photo?: string;
  status: CollaboratorStatus;
};

const collaboratorSchema = new Schema<CollaboratorInput>({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  name: { type: String, default: "" },
  photo: { type: String, default: "" },
  status: { type: String, enum: ["pending", "approved", "blocked"], default: "pending" },
}, { timestamps: true, versionKey: false });

export const Collaborator = mongoose.models.Collaborator || mongoose.model<CollaboratorInput>("Collaborator", collaboratorSchema);
