import jwt from "jsonwebtoken"
import moment, { Moment } from "moment"
import httpStatus from "http-status"
import { userService } from "services"
import { Token } from "models"
import { ApiError } from "utils"
import { TokenEnum, envVars } from "config"
import { Types } from "mongoose"
import { IUser } from "models/User"

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (
    userId: Types.ObjectId,
    expires: Moment,
    type: string,
    secret = envVars.jwt.secret
) => {
    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
    }
    return jwt.sign(payload, secret)
}

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
    const tokenDoc = await Token.create({
        token,
        user: userId,
        expires: expires.toDate(),
        type,
        blacklisted,
    })
    return tokenDoc
}

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token: string, type) => {
    const payload = jwt.verify(token, envVars.jwt.secret)
    const tokenDoc = await Token.findOne({
        token,
        type,
        user: payload.sub,
        blacklisted: false,
    })
    if (!tokenDoc) {
        throw new Error("Token not found")
    }
    return tokenDoc
}

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user: IUser) => {
    const accessTokenExpires = moment().add(
        envVars.jwt.accessExpirationMinutes,
        "minutes"
    )
    const accessToken = generateToken(
        user.id,
        accessTokenExpires,
        TokenEnum.ACCESS
    )

    const refreshTokenExpires = moment().add(
        envVars.jwt.refreshExpirationDays,
        "days"
    )
    const refreshToken = generateToken(
        user.id,
        refreshTokenExpires,
        TokenEnum.REFRESH
    )
    await saveToken(
        refreshToken,
        user.id,
        refreshTokenExpires,
        TokenEnum.REFRESH
    )

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    }
}

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email: string) => {
    const user = await userService.getUserByEmail(email)
    if (!user) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "No users found with this email"
        )
    }
    const expires = moment().add(
        envVars.jwt.resetPasswordExpirationMinutes,
        "minutes"
    )
    const resetPasswordToken = generateToken(
        user._id,
        expires,
        TokenEnum.RESET_PASSWORD
    )
    await saveToken(
        resetPasswordToken,
        user.id,
        expires,
        TokenEnum.RESET_PASSWORD
    )
    return resetPasswordToken
}

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user: IUser) => {
    const expires = moment().add(
        envVars.jwt.verifyEmailExpirationMinutes,
        "minutes"
    )
    const verifyEmailToken = generateToken(
        user.id,
        expires,
        TokenEnum.VERIFY_EMAIL
    )
    await saveToken(verifyEmailToken, user.id, expires, TokenEnum.VERIFY_EMAIL)
    return verifyEmailToken
}

const tokenService = {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthTokens,
    generateResetPasswordToken,
    generateVerifyEmailToken,
}

export default tokenService
