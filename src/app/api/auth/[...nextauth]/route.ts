// Route Handler ที่ Google จะ redirect กลับมา
// redirect URI: http://localhost:3000/api/auth/callback/google
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
