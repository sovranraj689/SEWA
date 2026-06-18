import Order from "../models/Order.js";
import { sendOrderConfirmation, sendOrderStatusUpdate } from "../utils/email.js";

// @POST /api/orders/custom
export const createOrder = async (req, res) => {
  try {
    const { name, email, phone, clothType, workArea, embroideryType, description, budget, timeline } = req.body;

    if (!name || !email || !phone || !clothType || !description)
      return res.status(400).json({ message: "Required fields missing" });

    const referenceImages = req.files?.map((f) => f.path) || [];

    const order = await Order.create({
      user: req.user?._id,
      name, email, phone, clothType,
      workArea: Array.isArray(workArea) ? workArea : JSON.parse(workArea || "[]"),
      embroideryType: Array.isArray(embroideryType) ? embroideryType : JSON.parse(embroideryType || "[]"),
      description, budget, timeline, referenceImages,
      statusHistory: [{ status: "pending", note: "Order received" }],
    });

    // Send confirmation email (non-blocking)
    sendOrderConfirmation(order).catch(console.error);

    res.status(201).json({ message: "Order submitted successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders/my  [user]
export const getMyOrders = async (req, res) => {
  try {
    console.log(`📡 Accessing backend custom orders registry for User: ${req.user?._id}`);
    
    // Fetch user items sorted by reverse creation timestamps
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // Sends object formatted exactly as { orders: [...] }
    res.json({ orders });
  } catch (err) {
    console.error("💥 Error encountered inside getMyOrders controller:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders  [admin]
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "name email");

    // Status counts for dashboard
    const counts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statusCounts = counts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {});

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit), statusCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/orders/:id  [admin or owner]
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email phone");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Allow only admin or the order owner
    if (!req.user.isAdmin && order.user?._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/orders/:id/status  [admin]
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNotes, estimatedDelivery, quotedPrice } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    if (adminNotes !== undefined) order.adminNotes = adminNotes;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);
    if (quotedPrice) order.quotedPrice = Number(quotedPrice);

    order.statusHistory.push({ status, note: adminNotes, updatedBy: req.user._id });
    await order.save();

    // Notify customer
    sendOrderStatusUpdate(order).catch(console.error);

    res.json({ message: "Status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};