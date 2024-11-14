import { Request } from "express"
import { IUser } from "models/User"
export interface IRequest<arg1 = unknown> extends Request {
    body: arg1
    user: IUser
}
