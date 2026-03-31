import { Router, type Request, type Response } from "express";
import { User } from "../lib/zodSchema";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
const saltRounds =10;
export const userRouter = Router();

userRouter.post("/signup",async (req:Request,res:Response)=>{
    const {email,password }= req.body;

    const result = User.safeParse({ email: email,password:password });
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
            message:"incorect username or password"
        })
    };

    const isMatch = await  bcrypt.compare(password,user?.password)
    

})