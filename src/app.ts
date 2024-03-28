import express from "express";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/errorHandler.js";
import NodeCache from "node-cache";
import {config} from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";

//Importing Routes
import userRoute from './routes/user.js';
import productRoutes from './routes/product.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import adminDashboardRoute from './routes/stats.js';
import cors from "cors";

//Uisng env file
config({
    path:"./.env",
});

//Connecting Port
const port = process.env.PORT || 3000;

//Connecting DB
const mongoURI = process.env.MONGO_URI || "";
connectDB(mongoURI);

//Stripe Handler
const stripeKey = process.env.STRIPE_KEY || "";
export const stripe = new Stripe(stripeKey);

//Cache Handler
export const nodeCache = new NodeCache();

//Server
const app = express();

//Using Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

//Normal get request 
app.get("/", (req, res)=>{
    res.send("Konichiva!!");
});



//Using Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/adminDashboard", adminDashboardRoute);



//Using multer for storing files
app.use("/uploads", express.static("uploads"));

//Using ErrorHnadler Middleware
app.use(errorMiddleware);

//Listening from the server
app.listen(port, ()=>{
    console.log(`Server is running at http://localhost:${port}`);
})

