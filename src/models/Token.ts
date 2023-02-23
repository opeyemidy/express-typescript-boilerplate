import { TokenEnum } from "../config"
import { Schema, SchemaTypes, model } from "mongoose"
import { toJSON } from "./plugins"
import { IUser } from "./User"

export interface IToken {
    token: string
    user: IUser["id"]
    isEmailVerified: boolean
    type: string
    expires: Date
    blacklisted: boolean
}

const tokenSchema = new Schema<IToken>(
    {
        token: {
            type: String,
            required: true,
            index: true,
        },
        user: {
            type: SchemaTypes.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: [
                TokenEnum.REFRESH,
                TokenEnum.RESET_PASSWORD,
                TokenEnum.VERIFY_EMAIL,
            ],
            required: true,
        },
        expires: {
            type: Date,
            required: true,
        },
        blacklisted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

// add plugin that converts mongoose to json
tokenSchema.plugin(toJSON)

/**
 * @typedef Token
 */
const Token = model("Token", tokenSchema)

export default Token
