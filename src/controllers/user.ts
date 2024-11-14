import httpStatus from "http-status"
import { userService } from "services"
import { catchAsync, pick, ApiError } from "utils"
import { IRequest } from "./interface"
import { IUser } from "models/User"
import { Types } from "mongoose"

const createUser = catchAsync(async (req: IRequest<IUser>, res) => {
    const user = await userService.createUser(req.body)
    res.status(httpStatus.CREATED).send(user)
})

const getUsers = catchAsync(async (req, res) => {
    const filter = pick(req.query, ["name", "role"])
    const options = pick(req.query, ["sortBy", "limit", "page"])
    const result = await userService.queryUsers(filter, options)
    res.send(result)
})

const getUser = catchAsync(async (req: IRequest, res) => {
    const user = await userService.getUserById(
        req.params.userId as unknown as Types.ObjectId
    )
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found")
    }
    res.send(user)
})

const updateUser = catchAsync(async (req: IRequest<IUser>, res) => {
    const user = await userService.updateUserById(
        req.params.userId as unknown as Types.ObjectId,
        req.body
    )
    res.send(user)
})

const deleteUser = catchAsync(async (req, res) => {
    await userService.deleteUserById(
        req.params.userId as unknown as Types.ObjectId
    )
    res.status(httpStatus.NO_CONTENT).send()
})

const userController = {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
}

export default userController
