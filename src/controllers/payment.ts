import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/errorHandler.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";

export const createPaymentIntent = TryCatch(async (req, res, next) => {
    const { amount } = req.body;
  
    if (!amount) return next(new ErrorHandler("Please enter amount", 400));
  
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "inr",
    });
    
    return res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
});

export const newCoupon = TryCatch(
    async(req, res, next)=>{
        const {coupon, amount} = req.body;

        if(!coupon || !amount) return next(new ErrorHandler("Enter both details!", 400));

        await Coupon.create({
            couponCode: coupon,
            amount,
        })

        return res.status(201).json({
            success:true,
            message:`Coupon ${coupon} Generated!`,
        });
    }
);

export const applyCoupon = TryCatch(
    async(req, res, next)=>{
        const {coupon} = req.query;

        const discount = await Coupon.findOne({couponCode: coupon});
        if(!discount) return next(new ErrorHandler("Inavalid Coupon!", 404));


        return res.status(200).json({
            success:true,
            discount: discount.amount,
        });
    }
);

export const allCoupon = TryCatch(
    async(req, res, next)=>{
 
        const coupons = await Coupon.find({});
        if(coupons.length === 0) return next(new ErrorHandler("No Coupon Available!", 404));


        return res.status(200).json({
            success:true,
            coupons,
        });
    }
);

export const deleteCoupon = TryCatch(
    async(req, res, next)=>{
        
        const {id} = req.params;
        const flag = await Coupon.findByIdAndDelete(id);

        if(!flag) return next(new ErrorHandler("Invalid Coupon ID", 404));

        return res.status(200).json({
            success:true,
            message:`Coupon ${flag} deleted!`,
        });
    }
);