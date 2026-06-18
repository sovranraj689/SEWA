import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const designSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Neck", "Sleeve", "Border", "Full Body", "Dupatta", "Other"],
    },
    embroideryType: { type: String },
    fabric: { type: String },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    tags: [{ type: String, trim: true }],
    deliveryTime: { type: String, default: "10-14 days" },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Recalculate rating when reviews change
designSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.reviewCount = 0;
  } else {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = Math.round((total / this.reviews.length) * 10) / 10;
    this.reviewCount = this.reviews.length;
  }
};

export default mongoose.model("Design", designSchema);