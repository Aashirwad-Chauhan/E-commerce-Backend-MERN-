import { TryCatch } from "../middlewares/errorHandler.js";
import { NextFunction, Request, Response } from "express";
import { INewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidateProductCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { nodeCache } from "../app.js";

export const newOrder = TryCatch(
    async(req:Request<{}, {}, INewOrderRequestBody>,
        res:Response, 
        next:NextFunction)=>{

        const {
            shippingInfo, 
            orderItems, 
            user, 
            subtotal, 
            tax, 
            shippingCharges,
            discount,
            total,
        } = req.body; 

        if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total){
            return next(new ErrorHandler("Please Enter All Fields", 400));
        }

        const order = await Order.create({
            shippingInfo, 
            orderItems, 
            user, 
            subtotal, 
            tax, 
            shippingCharges,
            discount,
            total,
        });

        await reduceStock(orderItems);

        await invalidateProductCache(
            {
                product:true, 
                order: true, 
                admin:true, 
                userId:user,
                productId: order.orderItems.map((i)=>String(i.productId)),
            }
        );

        return res.status(201).json({
            success:true,
            message: "Order Placed!",
        });


    }
);

export const allOrders = TryCatch(
    async(req, res, next)=>{
        const key = "all-orders";
        
        let orders = [];
        if(nodeCache.has(key)){
            orders = JSON.parse(nodeCache.get(key) as string);
        }
        else{
            orders = await Order.find().populate("user", "name");
            nodeCache.set(key, JSON.stringify(orders));
        }
        
        return res.status(200).json({
            success:true,
            orders,
        });
    }

);

export const myOrders = TryCatch(
    async(req, res, next)=>{
        
        const {id:user} = req.query;

        let orders = [];
        if(nodeCache.has(`myorders-${user}`)){
            orders = JSON.parse(nodeCache.get(`myorders-${user}`) as string);
        }
        else{
            orders = await Order.find({user});
            nodeCache.set(`myorders-${user}`, JSON.stringify(orders));
        }
        
        return res.status(200).json({
            success:true,
            orders,
        });
    }

);

export const getOrderByID = TryCatch(
    async(req, res, next)=>{
        
        const {id} = req.params;
        const key = `order-${id}`;

        let order;
        if(nodeCache.has(key)){
            order = JSON.parse(nodeCache.get(key) as string);
        }
        else{
            order = await Order.findById(id).populate("user", "name");
            if(!order) return next(new ErrorHandler("Order doesn't exists!", 404));
            nodeCache.set(key, JSON.stringify(order));
        }
        
        return res.status(200).json({
            success:true,
            order,
        });
    }

);

export const processOrder = TryCatch(
    async (req, res, next) => {
        const { id } = req.params;
        const order = await Order.findById(id);
        if (!order) return next(new ErrorHandler("Order Not Found!", 404));
    
        switch (order.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
            break;
        default:
            order.status = "Delivered";
            break;
        }
    
        await order.save();
    
        invalidateProductCache({
            product: false,
            order: true,
            admin: true,
            userId: order.user,
            orderId: String(order._id),
        });
    
        return res.status(200).json({
        success: true,
        message: "Order Processed Successfully!",
        });
  }
);
  
  export const deleteOrder = TryCatch(
    async (req, res, next) => {
        const { id } = req.params;
    
        const order = await Order.findById(id);
        if (!order) return next(new ErrorHandler("Order Not Found!", 404));
    
        await order.deleteOne();
    
        invalidateProductCache({
            product: false,
            order: true,
            admin: true,
            userId: order.user,
            orderId: String(order._id),
        });
    
        return res.status(200).json({
        success: true,
        message: "Order Deleted!",
        });
   }
);