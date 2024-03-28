import express from "express";

import { isAdmin } from "../middlewares/auth.js";
import { 
    deleteProduct,
    getAllCategory, 
    getAllProduct, 
    getLatestProduct, 
    getProductByID, 
    newProduct, 
    searchAllProduct, 
    updateProduct
} from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";

const app = express.Router();

//Route : /api/v1/product
app.post("/new", isAdmin, singleUpload, newProduct);

app.get("/latest", getLatestProduct);
app.get("/category", getAllCategory);
app.get("/admin-products", isAdmin, getAllProduct);

app.get("/search", searchAllProduct); 

app.route("/:id")
.get(getProductByID)
.put(isAdmin, singleUpload, updateProduct)
.delete(isAdmin, deleteProduct);



export default app;