import Design from "../models/Design.js";
import { cloudinary } from "../config/cloudinary.js";

// @GET /api/designs
export const getDesigns = async (req, res) => {
  try {
    const { category, search, sort = "-createdAt", page = 1, limit = 12, featured } = req.query;

    const filter = { isActive: true };
    if (category && category !== "All") filter.category = category;
    if (featured === "true") filter.isFeatured = true;
    if (search) filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
      { description: { $regex: search, $options: "i" } },
    ];

    const sortMap = {
      "-createdAt": { createdAt: -1 },
      "price_asc": { price: 1 },
      "price_desc": { price: -1 },
      "rating": { rating: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Design.countDocuments(filter);
    const designs = await Design.find(filter)
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-reviews");

    res.json({
      designs,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/designs/:id
export const getDesignById = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id).populate("reviews.user", "name avatar");
    if (!design || !design.isActive)
      return res.status(404).json({ message: "Design not found" });
    res.json({ design, reviews: design.reviews.sort((a, b) => b.createdAt - a.createdAt) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/designs  [admin]
export const createDesign = async (req, res) => {
  try {
    const { title, description, category, embroideryType, fabric, price, tags, deliveryTime, isFeatured } = req.body;

    if (!title || !category || price === undefined) {
      return res.status(400).json({ message: "Title, category, and price are required" });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      return res.status(400).json({ message: `Invalid price value: "${price}"` });
    }

    // images uploaded via multer-cloudinary
    const images = req.files?.map((f) => f.path) || [];

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        return res.status(400).json({ message: "Invalid tags format — must be JSON array string" });
      }
    }

    const design = await Design.create({
      title, description, category, embroideryType, fabric,
      price: numericPrice,
      tags: parsedTags,
      deliveryTime,
      isFeatured: isFeatured === "true",
      images,
      uploadedBy: req.user._id,
    });

    res.status(201).json({ message: "Design created", design });
  } catch (err) {
    console.error("❌ createDesign error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const updateDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: "Design not found" });

    const fields = ["title", "description", "category", "embroideryType", "fabric", "deliveryTime", "isActive", "isFeatured"];
    fields.forEach((f) => { if (req.body[f] !== undefined) design[f] = req.body[f]; });
    if (req.body.price) design.price = Number(req.body.price);
    if (req.body.tags) design.tags = JSON.parse(req.body.tags);

    // Append new images if any
    if (req.files?.length) {
      design.images.push(...req.files.map((f) => f.path));
    }

    await design.save();
    res.json({ message: "Design updated", design });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteDesign = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: "Design not found" });

    // Delete images from Cloudinary
    for (const url of design.images) {
      const publicId = url.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await design.deleteOne();
    res.json({ message: "Design deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment)
      return res.status(400).json({ message: "Rating and comment required" });

    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: "Design not found" });

    // One review per user
    const already = design.reviews.find((r) => r.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: "You have already reviewed this design" });

    const review = {
      user: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment,
    };

    design.reviews.push(review);
    design.updateRating();
    await design.save();

    const saved = design.reviews[design.reviews.length - 1];
    res.status(201).json({ message: "Review added", review: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/designs/:id/reviews/:reviewId  [admin]
export const deleteReview = async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ message: "Design not found" });
    design.reviews = design.reviews.filter((r) => r._id.toString() !== req.params.reviewId);
    design.updateRating();
    await design.save();
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTopReviews = async (req, res) => {
  try {
    const { limit = 6, minRating = 4 } = req.query;

    const topReviews = await Design.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$reviews" },
      { $match: { "reviews.rating": { $gte: Number(minRating) } } },
      {
        $project: {
          _id: 0,
          designId: "$_id",
          designTitle: "$title",
          designImage: { $arrayElemAt: ["$images", 0] },
          userName: "$reviews.userName",
          rating: "$reviews.rating",
          comment: "$reviews.comment",
          createdAt: "$reviews.createdAt",
          helpful: "$reviews.helpful",
        },
      },
      { $sort: { rating: -1, helpful: -1, createdAt: -1 } },
      { $limit: Number(limit) },
    ]);

    res.json({ reviews: topReviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};