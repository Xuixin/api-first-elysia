import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  phone: String,
  address: String,
  admin: {
    type: Boolean,
    default: false,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

const productSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: mongoose.Schema.Types.Decimal128, required: true },
  stock: { type: Number, required: true },
  image_url: [{ type: String }],
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

productSchema.index({ name: "text" });

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  total_amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  status: { type: String, default: "pending" },
  shipping_address: { type: String },
  payment_method: { type: String },
  order_date: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  items: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
      unit_price: { type: mongoose.Schema.Types.Decimal128, required: true },
      subtotal: { type: mongoose.Schema.Types.Decimal128, required: true },
    },
  ],
});

const reviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  rating: { type: Number, required: true },
  comment: { type: String },
  created_at: { type: Date, default: Date.now },
});

const cartSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  items: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
    },
  ],
});

export const User = mongoose.model("User", userSchema);
export const Category = mongoose.model("Category", categorySchema);
export const Product = mongoose.model("Product", productSchema);
export const Order = mongoose.model("Order", orderSchema);
export const Review = mongoose.model("Review", reviewSchema);
export const Cart = mongoose.model("Cart", cartSchema);
