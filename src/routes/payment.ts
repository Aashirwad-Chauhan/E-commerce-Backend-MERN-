import express from "express";
import { isAdmin } from "../middlewares/auth.js";
import { allCoupon, applyCoupon, createPaymentIntent, deleteCoupon, newCoupon } from "../controllers/payment.js";

const app = express.Router();

//Route : /api/v1/payment
app.post("/create", createPaymentIntent);
app.post("/coupon/new", isAdmin, newCoupon);
app.get("/couponapply", applyCoupon);
app.get("/coupon/all", isAdmin, allCoupon);
app.delete("/coupon/:id", isAdmin, deleteCoupon);

export default app;