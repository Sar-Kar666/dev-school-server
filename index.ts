import express, { type Request, type Response } from "express";
import { userRouter } from "./routes/user";
import { courseRouter } from "./routes/course";
import { purchaseRouter } from "./routes/purchase";
import cors from "cors";
const app =express();


app.use(cors())
app.use(express.json());
app.use("/user",userRouter);    
app.use("/courses",courseRouter);
app.use("/purchases",purchaseRouter);
;

app.get("/",(req:Request,res:Response)=>{
    res.json({
        message:"done"
    })
})

app.listen(4000)
