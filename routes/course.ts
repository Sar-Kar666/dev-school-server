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
    const{title,imageUrl,description,price,}= req.body;

    const course = await prisma.course.create({
        data:{
            title,
            description,
           price,
           imageUrl,
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

courseRouter.delete("/delete-course",adminAuth,async(req:Request,res:Response)=>{
    const {courseId}=req.body;
    if(!courseId) return res.status(400).json({message:"unauthorized"})
        try{ 
       const deleteCourse= await prisma.course.delete({
        where:{
            id:courseId
        }
    })
       return res.status(200).json({ message: "Course deleted successfully" });
    }catch(e:any){
       if (e.code === 'P2025') {
            return res.status(404).json({ message: "Course not found" });
        }
        return res.status(500).json({ message: "Internal server error", error: e.message});
    }


})