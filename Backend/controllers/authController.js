// import { OAuth2Client } from "google-auth-library";
// import User from "../models/User.js";
// import generateToken from "../utils/generateToken.js";
// import { sendWelcomeEmail } from "../utils/email.js";

// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // @POST /api/auth/register
// export const register = async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;

//     if (!name || !email || !password)
//       return res.status(400).json({ message: "Name, email and password are required" });

//     if (await User.findOne({ email }))
//       return res.status(400).json({ message: "Email already registered" });

//     const user = await User.create({ name, email, phone, password });

//     // Send welcome email (non-blocking)
//     sendWelcomeEmail(user).catch(console.error);

//     res.status(201).json({
//       message: "Account created successfully",
//       token: generateToken(user._id),
//       user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin, avatar: user.avatar },
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // @POST /api/auth/login
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ message: "Email and password required" });

//     const user = await User.findOne({ email });
//     if (!user || !user.password)
//       return res.status(401).json({ message: "Invalid credentials" });

//     if (!user.isActive)
//       return res.status(403).json({ message: "Account has been deactivated" });

//     const match = await user.matchPassword(password);
//     if (!match) return res.status(401).json({ message: "Invalid credentials" });

//     res.json({
//       token: generateToken(user._id),
//       user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin, avatar: user.avatar },
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // @POST /api/auth/google  — Google One-Tap / Sign-In with Google
// export const googleAuth = async (req, res) => {
//   try {
//     const { credential } = req.body;
//     if (!credential) return res.status(400).json({ message: "Google credential required" });

//     const ticket = await googleClient.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const { sub: googleId, email, name, picture } = ticket.getPayload();

//     let user = await User.findOne({ $or: [{ googleId }, { email }] });

//     if (user) {
//       // Update googleId if logging in via Google for first time
//       if (!user.googleId) { user.googleId = googleId; await user.save(); }
//     } else {
//       user = await User.create({ name, email, googleId, avatar: picture, isActive: true });
//       sendWelcomeEmail(user).catch(console.error);
//     }

//     res.json({
//       token: generateToken(user._id),
//       user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, avatar: user.avatar },
//     });
//   } catch (err) {
//     res.status(401).json({ message: "Google authentication failed" });
//   }
// };

// // @GET /api/auth/me
// export const getMe = async (req, res) => {
//   res.json({ user: req.user });
// };

// // @PUT /api/auth/profile
// export const updateProfile = async (req, res) => {
//   try {
//     const { name, phone, address } = req.body;
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       { name, phone, address },
//       { new: true, runValidators: true }
//     );
//     res.json({ user });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // @PUT /api/auth/change-password
// export const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;
//     const user = await User.findById(req.user._id);
//     if (user.password && !(await user.matchPassword(currentPassword)))
//       return res.status(400).json({ message: "Current password is incorrect" });
//     user.password = newPassword;
//     await user.save();
//     res.json({ message: "Password updated successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendWelcomeEmail } from "../utils/email.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required" });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, phone, password });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch(console.error);

    res.status(201).json({
      message: "Account created successfully",
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isActive)
      return res.status(403).json({ message: "Account has been deactivated" });

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/auth/google  — Google One-Tap / Sign-In with Google
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Google credential required" });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update googleId if logging in via Google for first time
      if (!user.googleId) { user.googleId = googleId; await user.save(); }
    } else {
      user = await User.create({ name, email, googleId, avatar: picture, isActive: true });
      sendWelcomeEmail(user).catch(console.error);
    }

    res.json({
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, avatar: user.avatar },
    });
  } catch (err) {
    res.status(401).json({ message: "Google authentication failed" });
  }
};

// @GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// @PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (user.password && !(await user.matchPassword(currentPassword)))
      return res.status(400).json({ message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/auth/addresses — add a new saved address
export const addAddress = async (req, res) => {
  try {
    const { label, fullName, phone, street, city, state, pincode, isDefault } = req.body;
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      return res.status(400).json({ message: "All address fields are required" });
    }

    const user = await User.findById(req.user._id);

    // If this is marked default, or it's the user's first address, unset others
    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push({
      label: label || "Home",
      fullName, phone, street, city, state, pincode,
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();
    res.status(201).json({ message: "Address added", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/auth/addresses/:addressId — edit an existing address
export const updateAddress = async (req, res) => {
  try {
    const { label, fullName, phone, street, city, state, pincode, isDefault } = req.body;
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    if (isDefault) user.addresses.forEach((a) => (a.isDefault = false));

    if (label !== undefined) address.label = label;
    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();
    res.json({ message: "Address updated", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/auth/addresses/:addressId
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    const wasDefault = address.isDefault;
    address.deleteOne();

    // If we deleted the default address, promote the first remaining one
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json({ message: "Address removed", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
