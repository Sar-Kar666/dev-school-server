import { Router, type Request, type Response } from "express";
import { adminAuth } from "../middlewares/adminAuth";
import { prisma } from "../lib/prisma";

export const courseRouter =Router();


courseRouter.post("/create",adminAuth,async (req:Request,res:Response)=>{
    try{
         const userId=req.user?.userId;
       if (!userId) {
            return res.status(401).json({
                message: "Unauthorized"
            });}
    const{title,description,price}= req.body;

    const course = await prisma.course.create({
        data:{
            title,
            description,
           price,
           creatorId:userId
        }
    })

      return res.status(201).json({
            message: "Course created successfully",
            course
        });
    }catch(e){
        res.status(500).json({
            message:"Internal server error"
        })
    }
   
})

courseRouter.get("/",async(req:Request,res:Response)=>{
    const userId= req.user?.userId;

    const courses=await  prisma.course.findMany({
        where:{
            creatorId:userId
        }
    })

    return res.json({
        courses
    })
})