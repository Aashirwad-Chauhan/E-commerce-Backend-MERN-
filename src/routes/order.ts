import express from "express";
import { isAdmin } from "../middlewares/auth.js";
import { allOrders, deleteOrder, getOrderByID, myOrders, newOrder, processOrder } from "../controllers/orders.js";

const app = express.Router();

//Route : /api/v1/order
app.post("/new", newOrder);
app.get("/myorder", myOrders);
app.get("/all",isAdmin, allOrders);

app.route("/:id").get(getOrderByID).put(isAdmin, processOrder).delete(isAdmin, deleteOrder);

export default app;