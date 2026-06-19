import mongoose from "mongoose";

const AboutSchema = new mongoose.Schema(
  {
    yearsOfExcellence: { type: Number, default: 8 },
    metrics: [
      {
        value: { type: String, required: true }, 
        label: { type: String, required: true } 
      }
    ],
    values: [
      {
        icon: { type: String, required: true }, 
        title: { type: String, required: true }, 
        desc: { type: String, required: true }  
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("About", AboutSchema);