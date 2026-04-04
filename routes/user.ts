import { Router, type Request, type Response } from "express";
import { User } from "../lib/zodSchema";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { userAuth } from "../middlewares/userAuth";
import { adminAuth } from "../middlewares/adminAuth";
const saltRounds =10;
export const userRouter = Router();

userRouter.post("/signup",async (req:Request,res:Response)=>{
    const {username,email,password }= req.body;

    const result = User.safeParse({ username:username,email: email,password:password });
    if (!result.success) {
    res.json({
        message: result.error.issues[0]?.message
    }) ;  
    } else {

        if( await prisma.user.findFirst({
            where:{
                email:email
            }
        })){
            res.json({
                message:"user already exists"
            })
        }else{
           const hassedPassword=await  bcrypt.hash(password, saltRounds)
            const user = await prisma.user.create({
            data:{
                username:username,
                email: email,
                password:hassedPassword
            }
        })


        res.json({
            message:  "done"
        })
      
        }
       
    }        
   
})


userRouter.post("/signin", async (req:Request,res:Response)=>{

    const {email,password}= req.body;

    const user = await  prisma.user.findUnique({
        where:{email:email}
    });

    if(!user){
        res.status(401).json({
            message:"Please signup to continue"
        })
    }else{
    const isMatch = await  bcrypt.compare(password,user.password);
    
    if(!isMatch){
        res.status(401).json({
            message:"incorrect password"
        })
    }
    else{

        const token = jwt.sign(
            {userId:user.id, role :user.role},process.env.JWT_SECRET!
        )
         res.json({
        message:"singed up succesfully",
        token,
        role:user.role
        
    })
    }
    
    }

   
   

})


userRouter.get("/",userAuth,async(req:Request,res:Response)=>{
    const userId=req.user?.userId;

    const user = await prisma.user.findFirst({
        where:{
            id:userId
        },select:{
            username:true,
            email:true
        }
    })

    res.json({
        user
    })
})

userRouter.get("/courses",userAuth,async(req:Request,res:Response)=>{

    const userId=req.user?.userId;
    if(!userId){
        return res.status(401).json({
            message:"Invalid token"
        })
    }

    const courses = await prisma.purchase.findMany({
        where: { userId: userId },
    include: {
        course: true 
    }
    })

    return res.status(201).json({
        courses
    })
})

