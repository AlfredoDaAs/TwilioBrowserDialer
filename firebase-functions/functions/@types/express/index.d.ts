import { namespace } from "firebase-functions/lib/providers/firestore";

declare global {
    namespace Express {
        interface Request {
            decoded: any,
            isAdmin: Boolean
        }
    }
}