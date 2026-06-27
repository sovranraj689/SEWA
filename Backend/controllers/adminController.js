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
// ── Updated: now includes orderCount + addressCount for the Users panel ──
export const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).lean();

    // Attach per-user order count in parallel
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ user: user._id });
        return {
          ...user,
          orderCount,
          addressCount: user.addresses?.length || 0,
          lastActive:   user.lastActive || user.updatedAt || null,
        };
      })
    );

    res.json({ users: usersWithStats, total: usersWithStats.length });
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

// @GET /api/admin/activity?limit=40
// ── New: streams recent platform actions to the Activity Feed ──
export const getActivityFeed = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 40, 100);

    // Fetch recent orders — each one becomes an "order_placed" activity event
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("user", "name email")
      .lean();

    const orderActivities = recentOrders.map((order) => ({
      _id:       order._id,
      type:      "order_placed",
      user: {
        name:  order.user?.name  || order.name  || "Unknown",
        email: order.user?.email || order.email || "",
      },
      meta: {
        clothType: order.clothType,
      },
      createdAt: order.createdAt,
    }));

    // Fetch recently registered users — each becomes a "register" activity event
    const recentUsers = await User.find({ isAdmin: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const registerActivities = recentUsers.map((user) => ({
      _id:       `reg_${user._id}`,
      type:      "register",
      user: {
        name:  user.name  || "Unknown",
        email: user.email || "",
      },
      meta: {},
      createdAt: user.createdAt,
    }));

    // Merge and sort all activities by date descending
    const activities = [...orderActivities, ...registerActivities]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    res.json({ activities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};