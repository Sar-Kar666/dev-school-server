import type { NextFunction, Request, Response } from "express";
import jwt, { decode } from "jsonwebtoken"

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


export const userAuth=(req:Request,res:Response,next:NextFunction)=>{
    const token  =req.headers.token  as string;
    if(!token){
        return res.status(401).json({
            message:"no token provided"
        })
    }
         try{
            const decoded = jwt.verify(token,process.env.JWT_SECRET!)as jwtPayload;
            if(!decoded){
              return  res.status(403).json({
                    message:"Invalid Token"
                })
            }else{
                req.user = decoded;
                next();
            }
         }catch(e){
            res.status(401).json({
                message:" Invalid token"
            })
         }
          
    }
   

 
