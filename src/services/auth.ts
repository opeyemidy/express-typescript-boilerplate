import httpStatus from "http-status"
import { Token } from "models"
import { ApiError } from "utils"
import { userService, tokenService } from "services"
import { TokenEnum } from "@config"
import { Types } from "mongoose"

const loginUserWithEmailAndPassword = async (
    email: string,
    password: string
) => {
    const user = await userService.getUserByEmail(email)
    if (!user || !(await user.isPasswordMatch(password))) {
        throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Incorrect email or password"
        )
    }
    return user
}

const logout = async (refreshToken: string): Promise<void> => {
    const refreshTokenDoc = await Token.findOne({
        token: refreshToken,
        type: TokenEnum.REFRESH,
        blacklisted: false,
    })
    if (!refreshTokenDoc) {
        throw new ApiError(httpStatus.NOT_FOUND, "Not found")
    }
    await refreshTokenDoc.remove()
}

const refreshAuth = async (refreshToken: string) => {
    try {
        const refreshTokenDoc = await tokenService.verifyToken(
            refreshToken,
            TokenEnum.REFRESH
        )
        const user = await userService.getUserById(refreshTokenDoc.user)
        if (!user) {
            throw new Error()
        }
        await refreshTokenDoc.remove()
        return tokenService.generateAuthTokens(user)
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate")
    }
}

const resetPassword = async (
    resetPasswordToken: string,
    newPassword: string
) => {
    try {
        const resetPasswordTokenDoc = await tokenService.verifyToken(
            resetPasswordToken,
            TokenEnum.RESET_PASSWORD
        )
        const user = await userService.getUserById(resetPasswordTokenDoc.user)
        if (!user) {
            throw new Error()
        }
        await userService.updateUserById(user.id as Types.ObjectId, {
            password: newPassword,
        })
        await Token.deleteMany({
            user: user.id,
            type: TokenEnum.RESET_PASSWORD,
        })
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Password reset failed")
    }
}

const verifyEmail = async (verifyEmailToken: string) => {
    try {
        const verifyEmailTokenDoc = await tokenService.verifyToken(
            verifyEmailToken,
            TokenEnum.VERIFY_EMAIL
        )
        const user = await userService.getUserById(verifyEmailTokenDoc.user)
        if (!user) {
            throw new Error()
        }
        await Token.deleteMany({ user: user.id, type: TokenEnum.VERIFY_EMAIL })
        await userService.updateUserById(user.id as Types.ObjectId, {
            isEmailVerified: true,
        })
    } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Email verification failed")
    }
}

const authService = {
    loginUserWithEmailAndPassword,
    logout,
    refreshAuth,
    resetPassword,
    verifyEmail,
}

export default authService
