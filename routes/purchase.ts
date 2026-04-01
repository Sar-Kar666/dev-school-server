import { Router, type Request, type Response } from "express";
import { userAuth } from "../middlewares/userAuth";
import { prisma } from "../lib/prisma";

export const purchaseRouter = Router();

purchaseRouter.post("/buy",userAuth,async(req:Request,res:Response)=>{
    const userId= req.user?.userId;
    const courseId= req.body.courseId;

    if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    

    const purchase = await prisma.purchase.create({
        data:{
            userId,
            courseId:courseId
        }
    })

    res.json({
        message:"Done purchasing",
        purchase
    })
})
