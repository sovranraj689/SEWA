import User from "../models/User.js";
import Order from "../models/Order.js";
import Design from "../models/Design.js";

// @GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders, pendingOrders, inProgressOrders, completedOrders,
      totalUsers, totalDesigns,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "in_progress" }),
      Order.countDocuments({ status: "completed" }),
      User.countDocuments({ isAdmin: false }),
      Design.countDocuments({ isActive: true }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email"),
    ]);

    // Monthly order trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyTrend = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      stats: { totalOrders, pendingOrders, inProgressOrders, completedOrders, totalUsers, totalDesigns },
      recentOrders,
      monthlyTrend,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  try {
    const { isAdmin, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isAdmin, isActive },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};