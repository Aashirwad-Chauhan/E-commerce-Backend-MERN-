import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/errorHandler.js";
import { IBaseQuery, INewProductReqBody, SearchRequestQuery } from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { nodeCache } from "../app.js";
import { invalidateProductCache } from "../utils/features.js";

export const newProduct = TryCatch(
    async(req:Request<{}, {}, INewProductReqBody>, 
        res:Response, 
        next:NextFunction)=>
    {
        const {name, price, stock, category} = req.body;
        const photo = req.file;

        if (!photo) return next(new ErrorHandler("Please add Photo", 400));

        if (!name || !price || !stock || !category) {
          rm(photo.path, () => {
            console.log("Deleted");
          });
    
          return next(new ErrorHandler("Please enter all Fields", 400));
        }

        await Product.create({
            name, 
            price, 
            stock, 
            category: category.toLowerCase(),
            photo: photo.path,
        });

        await invalidateProductCache({product: true, admin: true});

        return res.status(201).json({
            success:true,
            message:"Product added Successfully!",
        });
    }
);

//Cache revalidation on update, delete, new, order
export const getLatestProduct = TryCatch(
    async(req:Request, 
        res:Response, 
        next:NextFunction)=>
    {
        let products;

        if(nodeCache.has("latest-products")){ 
            products = JSON.parse(nodeCache.get("latest-products") as string);
        }
        else{
            products = await Product.find({}).sort({createdAt:-1}).limit(5);
            nodeCache.set("latest-products", JSON.stringify(products));
        }    

        return res.status(200).json({
            success:true,
            products,
        });
    }
);

//Cache revalidation on update, delete, new, order
export const getAllCategory = TryCatch(
    async(req:Request, 
        res:Response, 
        next:NextFunction)=>
    {
        let categories;

        if(nodeCache.has("categories")){ 
            categories = JSON.parse(nodeCache.get("categories") as string);
        }
        else{
            categories = await Product.distinct("category");
            nodeCache.set("categories", JSON.stringify(categories));
        }   

        return res.status(200).json({
            success:true,
            categories,
        });
    }
);


//Cache revalidation on update, delete, new, order
export const getAllProduct = TryCatch(
    async(req:Request, 
        res:Response, 
        next:NextFunction)=>
    {
        let products;
        if(nodeCache.has("all-products")){ 
            products = JSON.parse(nodeCache.get("all-products") as string);
        }
        else{
            products = await Product.find({});
            if(products.length === 0) return next(new ErrorHandler("Products doesn't exist!", 404));
            nodeCache.set("all-products", JSON.stringify(products));
        }  

        return res.status(200).json({
            success:true,
            products,
        });
    }
);

export const getProductByID = TryCatch(
    async(req:Request, 
        res:Response, 
        next:NextFunction)=>
    {   
        
        let product;
        const id = req.params.id;
        if(nodeCache.has(`product-${id}`)){ 
            product = JSON.parse(nodeCache.get(`product-${id}`) as string);
        }
        else{
            product = await Product.findById(id);
            if(!product) return next(new ErrorHandler("Product doesn't exist!", 404));
            nodeCache.set(`product-${id}`, JSON.stringify(product));
        }  

        return res.status(200).json({
            success:true,
            product,
        });
    }
);

export const updateProduct = TryCatch(
    async(req:Request, 
        res:Response, 
        next:NextFunction)=>
    {   
        const {id} = req.params;
        const {name, price, stock, category} = req.body;
        const photo = req.file;
        const product = await Product.findById(id);

        if(!product) return next(new ErrorHandler("Product doesn't exist!", 404));

        if (photo) {
          rm(product.photo, () => {
            console.log("Old Pic Deleted");
          });

          product.photo = photo.path;
        }

        if(name) product.name = name;
        if(price) product.price = price;
        if(stock) product.stock = stock;
        if(category) product.category = category;

        await product.save();
        await invalidateProductCache({
            product: true, 
            productId:String(product._id),
            admin: true,
        });

        return res.status(200).json({
            success:true,
            message:"Product Updated Successfully!",
        });
    }
);

export const deleteProduct = TryCatch(
    async(req:Request, 
        res:Response, 
        next:NextFunction)=>
    {   
        // const {id} = req.params;
        const product = await Product.findById(req.params.id);
        if(!product) return next(new ErrorHandler("Product doesn't exist!", 404));

        rm(product.photo, () => {
            console.log("Pic Deleted");
        });
        await product.deleteOne();
        
        await invalidateProductCache({
            product: true, 
            productId:String(product._id),
            admin: true,
        });

        return res.status(200).json({
            success:true,
            message:"Product Deleted!",
        });
    }
);

export const searchAllProduct = TryCatch(
    async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
      const { search, sort, category, price } = req.query;
  
      const page = Number(req.query.page) || 1;
      const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
      const skip = (page - 1) * limit;
  
      const baseQuery: IBaseQuery = {};
  
      if (search)
        baseQuery.name = {
          $regex: search,
          $options: "i",
        };
  
      if (price)
        baseQuery.price = {
          $lte: Number(price),
        };
  
      if (category) baseQuery.category = category;
  
      const productsPromise = Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);
  
      const [products, filteredOnlyProduct] = await Promise.all([
        productsPromise,
        Product.find(baseQuery),
      ]);
  
      const totalPage = Math.ceil(filteredOnlyProduct.length / limit);
  
      return res.status(200).json({
        success: true,
        products,
        totalPage,
      });
    }
  );
  