import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { INewUserReqBody } from "../types/types.js";
import { TryCatch } from "../middlewares/errorHandler.js";
import ErrorHandler from "../utils/utility-class.js";

export const newUser = TryCatch(
    async(
            req:Request<{}, {}, INewUserReqBody>, 
            res:Response, 
            next:NextFunction
    )=>{

        const {_id, name, email, photo, gender, dob} = req.body;

        let user = await User.findById(_id);
        if(user) return res.status(200).json({
            success:true,
            message:`Konichiva! ${user.name}`,
        });

        if(!_id || !name || !email || !gender || !photo || !dob) return 
            next(new ErrorHandler("Please fill up all fields!", 400));

        user = await User.create({
            _id,
            name, 
            email, 
            photo, 
            gender, 
            dob: new Date(dob), 
        });

        return res.status(201).json({
            success:true,
            message:`User Added! Welcome Onboard, ${user.name}`,
        });
    }
);

export const getAllUsers = TryCatch(
    async(req, res, next)=>{
        const users = await User.find({});

        return res.status(200).json({
            success:true,
            users,
        });
    }
);

export const getUserByID = TryCatch(
    async(req, res, next)=>{
        const id = req.params.id;
        const user = await User.findById(id);

        if(!user) return next(new ErrorHandler("User not found!", 404));

        return res.status(200).json({
            success:true,
            user,
        });
    }
);

export const deleteUserByID = TryCatch(
    async(req, res, next)=>{
        const id = req.params.id;
        const user = await User.findById(id);

        if(!user) return next(new ErrorHandler("User not found!", 404));

        await user.deleteOne();
        return res.status(200).json({
            success:true,
            message:"User Deleted!",
        });
    }
);