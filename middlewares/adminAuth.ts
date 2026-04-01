import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"


interface jwtPayload{
    userId:string;
    role:string;
}
declare global {
    namespace Express {
        interface Request {
            user?: jwtPayload;
        }
    }
}

export const adminAuth=(req:Request,res:Response,next:NextFunction)=>{
    const token =req.headers.token as string;
    if(!token){
        return res.status(401).json({
            message:"no token provided"
        })
    }
      
         try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwtPayload;
            if(decoded.role!=="ADMIN"){
               return  res.status(403).json({
                    message:"Admins Only!!"
                })
            }else{
                req.user = decoded;
                next();
            }
         }catch(e){
           return  res.status(401).json({
                message:" Invalid token"
            })
         }
          
       

 
}

