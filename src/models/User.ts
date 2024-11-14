import validator from "validator"
import bcrypt from "bcrypt"
import { Roles, roles } from "../config"
import { Schema, model, Types, Model, HydratedDocument } from "mongoose"
import { paginate, softDeletePlugin, toJSON } from "models/plugins"

export interface PaginationOptions {
    limit?: number
    page?: number
    sortBy?: string
    populate?: string
    select?: string
}

export interface IUser {
    id: Types.ObjectId
    firstName: string
    lastName: string
    email: string
    avatar?: string
    password: string
    role: Roles
    isEmailVerified: boolean
    fullName: string
}

interface IUserMethods {
    fullName(): string
    isPasswordMatch(pass: string): Promise<boolean>
}

interface UserModel extends Model<IUser, object, IUserMethods> {
    paginate(
        filter: unknown,
        options: PaginationOptions
    ): Promise<HydratedDocument<IUser, IUserMethods>>
    createWithFullName(
        name: string
    ): Promise<HydratedDocument<IUser, IUserMethods>>
    isEmailTaken(
        email: string,
        excludeUserId?: Types.ObjectId
    ): Promise<boolean>
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value: string) {
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid email")
                }
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 8,
            validate(value: string) {
                if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
                    throw new Error(
                        "Password must contain at least one letter and one number"
                    )
                }
            },
            private: true, // used by the toJSON plugin
        },
        role: {
            type: String,
            enum: roles,
            default: "user",
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

userSchema.virtual("fullName").get(function (this: IUser) {
    return `${this.firstName} ${this.lastName}`
})

userSchema.plugin(toJSON)
userSchema.plugin(paginate)
userSchema.plugin(softDeletePlugin)

userSchema.statics.isEmailTaken = async function (
    email: string,
    excludeUserId: Types.ObjectId
): Promise<boolean> {
    const user = await this.findOne({ email, _id: { $ne: excludeUserId } })
    return !!user
}

userSchema.methods.isPasswordMatch = async function (
    password: string
): Promise<boolean> {
    const user = this as IUser
    return bcrypt.compare(password, user.password)
}

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})

const User = model<IUser, UserModel>("User", userSchema)

export default User
