import * as z from "zod"; 
 
export const User = z.object({ 
  email: z.email(),
  password: z.string().trim().min(6)
});