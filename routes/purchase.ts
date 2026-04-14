import { Router, type Request, type Response } from "express";
import { userAuth } from "../middlewares/userAuth";
import { prisma } from "../lib/prisma";
import Razorpay from "razorpay";
import crypto from "crypto";
export const purchaseRouter = Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});



purchaseRouter.post("/buy",userAuth,async(req:Request,res:Response)=>{
    const userId= req.user?.userId;
    const courseId= req.body.courseId;

    if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId }
        });

        if (!course) return res.status(404).json({ message: "Course not found" });

        const existingPurchase = await prisma.purchase.findFirst({
                    where: { userId, courseId },
                });

         if (existingPurchase) {
            return res.status(400).json({ message: "You already own this course" });
        }       

    const options = {
            amount: Math.round(course.price * 100), // Amount in paise
            currency: "INR",
            receipt: `course_buy_${userId}_${courseId}`,
        };
    const rzpOrder = await razorpay.orders.create(options);

    res.json({
            message: "Order created successfully",
            orderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency
        })}catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error during order creation" });
    }
});
        
purchaseRouter.post("/verify", userAuth, async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature, 
        courseId // Pass this from frontend to know what was bought
    } = req.body;

    // 1. Validate Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
        return res.status(400).json({ message: "Invalid payment signature" });
    }

    try {
        // 2. Transactional Update: Create purchase record
        // We use a transaction to ensure we don't create duplicates 
        // if a webhook also tries to fulfill the order
        const purchase = await prisma.$transaction(async (tx) => {
            const alreadyBought = await tx.purchase.findFirst({
                where: { userId, courseId }
            });

            if (alreadyBought) return alreadyBought;

            return await tx.purchase.create({
                data: {
                    userId: userId!,
                    courseId: courseId,
                    // You might want to add a field for paymentId in your schema
                    // paymentId: razorpay_payment_id 
                }
            });
        });

        res.json({
            message: "Payment verified and course unlocked",
            purchase
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to unlock course after payment" });
    }
});



purchaseRouter.get("/my-courses",userAuth,async(req:Request,res:Response)=>{
    const userId= req.user?.userId;

    if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
  

    const purchasedCourses= await prisma.purchase.findMany({
        where: {
            userId: userId,
        },
        include: {
            course: true, // Includes all the fields from the Course model
        },
        });

    res.json({
        message:"Owned Courses",
        purchasedCourses
    })
})
