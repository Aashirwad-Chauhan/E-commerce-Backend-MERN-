import mongoose from "mongoose";
import { InvalidateProductCacheType, OrderItemType } from "../types/types.js";
import { nodeCache } from "../app.js";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";
import { Document } from "mongoose";

export const connectDB = (uri: string)=>{
    mongoose.connect(uri ,{
        dbName: "EC",
    })
    .then((c)=>console.log(`DB connected to ${c.connection.host}`))
    .catch((e)=>console.log(e));
};

export const invalidateProductCache = async (
    {product, 
    order, 
    admin, 
    userId,
    orderId,
    productId
    } : InvalidateProductCacheType)=>{
    if(product){
        const productKeys : string[] = ["latest-products", "categories", "all-products"];
        
        if(typeof productId === "string") productKeys.push(`product-${productId}`);
        if(typeof productId === "object"){
            productId.forEach((it)=> productKeys.push(`product-${it}`));
        }

        nodeCache.del(productKeys);
    }
    if(order){
        const orderKeys : string[] = ["all-orders", `myorders-${userId}`, `order-${orderId}`]; 

        nodeCache.del(orderKeys);
    }
    if(admin){
        nodeCache.del([
            "admin-stats",
            "admin-pie-charts",
            "admin-bar-charts",
            "admin-line-charts",
        ]);
    }
};

export const reduceStock = async(orderItems: OrderItemType[])=>{
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await Product.findById(order.productId);

        if(!product) throw new Error("Product not found!");

        product.stock -= order.quantity;
        await product.save();
    }
};


export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
    if (lastMonth === 0) return thisMonth * 100;
    const percent = (thisMonth / lastMonth) * 100;
    return Number(percent.toFixed(0));
};
  
export const getInventories = async ({
    categories,
    productsCount,
    }: {
    categories: string[];
    productsCount: number;
    }) => {
    const categoriesCountPromise = categories.map((category) =>
        Product.countDocuments({ category })
    );

    const categoriesCount = await Promise.all(categoriesCountPromise);

    const categoryCount: Record<string, number>[] = [];

    categories.forEach((category, i) => {
        categoryCount.push({
        [category]: Math.round((categoriesCount[i] / productsCount) * 100),
        });
    });

    return categoryCount;
};

interface MyDocument extends Document {
    createdAt: Date;
    discount?: number;
    total?: number;
    }
    type FuncProps = {
    length: number;
    docArr: MyDocument[];
    today: Date;
    property?: "discount" | "total";
};

export const getChartData = ({
    length,
    docArr,
    today,
    property,
    }: FuncProps) => {
    const data: number[] = new Array(length).fill(0);

    docArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < length) {
        if (property) {
            data[length - monthDiff - 1] += i[property]!;
        } else {
            data[length - monthDiff - 1] += 1;
        }
        }
    });

    return data;
};