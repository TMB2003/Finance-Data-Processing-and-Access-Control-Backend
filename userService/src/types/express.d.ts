import { UserRequest } from "./userTypes";

declare global {
    namespace Express {
        interface Request {
            user?: UserRequest;
        }
    }
}
