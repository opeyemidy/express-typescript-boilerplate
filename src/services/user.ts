import httpStatus from "http-status"
import { User } from "models"
import { IUser, PaginationOptions } from "models/User"
import { Types } from "mongoose"
import { ApiError } from "utils"

const createUser = async (userBody: IUser): Promise<IUser> => {
    if (await User.isEmailTaken(userBody.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken")
    }
    return User.create(userBody)
}

const queryUsers = async (filter: unknown, options: PaginationOptions) => {
    const users = await User.paginate(filter, options)
    return users
}

const getUserById = async (id: Types.ObjectId) => {
    return User.findById(id)
}

const getUserByEmail = async (email: string) => {
    return User.findOne({ email })
}

const updateUserById = async (
    userId: Types.ObjectId,
    updateBody: Partial<IUser>
) => {
    const user = await getUserById(userId)
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "IUser not found")
    }
    if (
        updateBody.email &&
        (await User.isEmailTaken(updateBody.email, userId))
    ) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken")
    }
    Object.assign(user, updateBody)
    await user.save()
    return user
}

const deleteUserById = async (userId: Types.ObjectId): Promise<IUser> => {
    const user = await getUserById(userId)
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "IUser not found")
    }
    await user.remove()
    return user
}

const userService = {
    createUser,
    queryUsers,
    getUserById,
    getUserByEmail,
    updateUserById,
    deleteUserById,
}

export default userService
