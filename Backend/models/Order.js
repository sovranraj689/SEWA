import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Customer info (for guest orders too)
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    // Design preferences
    clothType: {
      type: String,
      required: true,
      enum: ["Suit", "Saree", "Lehenga", "Kurta", "Dupatta", "Blouse", "Other"],
    },
    workArea: [{ type: String }],
    embroideryType: [{ type: String }],
    description: { type: String, required: true },
    budget: { type: String },
    timeline: { type: String },
    referenceImages: [{ type: String }],
    // Admin management
    status: {
      type: String,
      enum: ["pending", "approved", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    adminNotes: { type: String },
    estimatedDelivery: { type: Date },
    quotedPrice: { type: Number },
    // Tracking
    statusHistory: [
      {
        status: String,
        note: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);