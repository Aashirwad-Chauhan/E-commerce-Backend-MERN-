import { NextFunction, Request, Response } from "express";

export interface INewUserReqBody {
    _id: string;
    name: string;
    email:string;
    photo: string;
    gender: string;
    dob : Date;
}

export interface INewProductReqBody {
    name: string;
    photo: string;
    price: number;
    stock: number;
    category: string;
}

export type SearchRequestQuery = {
    search?: string;
    price?: string;
    category?: string;
    sort?: string;
    page?: string;
};
  
export interface IBaseQuery {
    name?: {
      $regex: string;
      $options: string;
    };
    price?: { $lte: number };
    category?: string;
}


export type ControllerType = (
    req: Request, 
    res: Response, 
    next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;



export type InvalidateProductCacheType = {
    product?: boolean;
    order?: boolean;
    admin?: boolean;
    userId?: string;
    orderId?: string;
    productId?: string | string[];
}    

export type OrderItemType = {
    name: string;
    photo: string;
    price: number;
    quantity: number;
    productId: string;
};
  
export type ShippingInfoType = {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: number;
};
  
export interface INewOrderRequestBody {
    shippingInfo: ShippingInfoType;
    user: string;
    subtotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    orderItems: OrderItemType[];
}
  