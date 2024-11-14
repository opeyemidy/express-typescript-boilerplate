import { Response } from "express"
import httpStatus from "http-status"
import { IUser } from "models/User"
import { emailService, tokenService, userService } from "services"
import authService from "services/auth"
import { catchAsync } from "utils"
import { IRequest } from "./interface"

const register = catchAsync(async (req: IRequest<IUser>, res: Response) => {
    const user = await userService.createUser(req.body)
    const tokens = await tokenService.generateAuthTokens(user)
    res.status(httpStatus.CREATED).send({ user, tokens })
})

const login = catchAsync(async (req: IRequest<IUser>, res) => {
    const { email, password } = req.body
    const user = await authService.loginUserWithEmailAndPassword(
        email,
        password
    )
    const tokens = await tokenService.generateAuthTokens(user)
    res.send({ user, tokens })
})

const logout = catchAsync(
    async (req: IRequest<{ refreshToken: string }>, res) => {
        await authService.logout(req.body.refreshToken)
        res.status(httpStatus.NO_CONTENT).send()
    }
)

const refreshTokens = catchAsync(
    async (req: IRequest<{ refreshToken: string }>, res) => {
        const tokens = await authService.refreshAuth(req.body.refreshToken)
        res.send({ ...tokens })
    }
)

const forgotPassword = catchAsync(async (req: IRequest<IUser>, res) => {
    const resetPasswordToken = await tokenService.generateResetPasswordToken(
        req.body.email
    )
    await emailService.sendResetPasswordEmail(
        req.body.email,
        resetPasswordToken
    )
    res.status(httpStatus.NO_CONTENT).send()
})

const resetPassword = catchAsync(
    async (req: IRequest<{ password: string }>, res) => {
        await authService.resetPassword(
            req.query.token as string,
            req.body.password
        )
        res.status(httpStatus.NO_CONTENT).send()
    }
)

const sendVerificationEmail = catchAsync(async (req: IRequest, res) => {
    const verifyEmailToken = await tokenService.generateVerifyEmailToken(
        req.user
    )
    await emailService.sendVerificationEmail(req.user.email, verifyEmailToken)
    res.status(httpStatus.NO_CONTENT).send()
})

const verifyEmail = catchAsync(async (req, res) => {
    await authService.verifyEmail(req.query.token as string)
    res.status(httpStatus.NO_CONTENT).send()
})

const authController = {
    register,
    login,
    logout,
    refreshTokens,
    forgotPassword,
    resetPassword,
    sendVerificationEmail,
    verifyEmail,
}

export default authController
