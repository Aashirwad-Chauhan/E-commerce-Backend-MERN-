import express from "express";
import { deleteUserByID, getAllUsers, getUserByID, newUser } from "../controllers/user.js";
import { isAdmin } from "../middlewares/auth.js";

const app = express.Router();

//Route : /api/v1/user/new
app.post("/new", newUser);
app.get("/all", isAdmin, getAllUsers);
app.route("/:id").get(getUserByID).delete(isAdmin, deleteUserByID);

export default app;