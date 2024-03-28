import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./errorHandler.js";

export const isAdmin = TryCatch(
    async(req, res, next)=>{
        const {id} = req.query;
        if(!id) return next(new ErrorHandler("User is not Logged In!", 401));
        
        const user = await User.findById(id);
        if(!user) return next(new ErrorHandler("User doesn't exists!", 400));

        if(user.role !== "admin") return next(new ErrorHandler("User doesn't have admin rights!", 401));
        
        next();
    }
);