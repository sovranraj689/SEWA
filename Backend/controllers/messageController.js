import Message from "../models/Message.js";

// @POST /api/contact  [public]
export const createMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: "Name, email and message are required" });

    const saved = await Message.create({ name, email, phone, message });
    res.status(201).json({ message: "Message sent successfully", data: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/contact  [admin]
export const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = unreadOnly === "true" ? { isRead: false } : {};

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Message.countDocuments(filter);
    const unreadCount = await Message.countDocuments({ isRead: false });
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ messages, total, unreadCount, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/contact/:id/read  [admin]
export const markMessageRead = async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json({ message: "Marked as read", data: message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/contact/:id  [admin]
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};