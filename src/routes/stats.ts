import express from "express";
import { isAdmin } from "../middlewares/auth.js";
import { getBarCharts, getDashboardStats, getLineCharts, getPieCharts } from "../controllers/stats.js";

const app = express.Router();

//Route : /api/v1/adminDashboard
app.get("/stats", isAdmin, getDashboardStats);
app.get("/piechart", isAdmin, getPieCharts);
app.get("/barchart", isAdmin, getBarCharts);
app.get("/linechart", isAdmin, getLineCharts);

export default app;