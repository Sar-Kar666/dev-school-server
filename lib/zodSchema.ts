import * as z from "zod"; 
 
export const User = z.object({ 
  username: z.string().trim().min(4).max(10),
  email: z.email(),
  password: z.string().trim().min(6)
});