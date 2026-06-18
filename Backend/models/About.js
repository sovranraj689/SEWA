import mongoose from "mongoose";

const AboutSchema = new mongoose.Schema(
  {
    yearsOfExcellence: { type: Number, default: 8 },
    metrics: [
      {
        value: { type: String, required: true }, // e.g. "1200+"
        label: { type: String, required: true }  // e.g. "Happy Clients"
      }
    ],
    values: [
      {
        icon: { type: String, required: true },  // e.g. "🪡"
        title: { type: String, required: true }, // e.g. "Craftsmanship"
        desc: { type: String, required: true }   // e.g. "Every piece is handcrafted..."
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("About", AboutSchema);