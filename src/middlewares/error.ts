import { envVars, logger } from "@config"
import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status"
import mongoose from "mongoose"
import { ApiError } from "utils"

const errorConverter = (
    err: { statusCode: number; message: string; stack?: string },
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let error = err
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode || error instanceof mongoose.Error
                ? httpStatus.BAD_REQUEST
                : httpStatus.INTERNAL_SERVER_ERROR
        const message = error.message || httpStatus[statusCode]
        error = new ApiError(statusCode, message, false, err.stack)
    }
    next(error)
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (
    err: {
        statusCode: number
        message: string
        stack: string
        isOperational: boolean
    },
    req: Request,
    res: Response
) => {
    let { statusCode, message } = err
    if (envVars.env === "production" && !err.isOperational) {
        statusCode = httpStatus.INTERNAL_SERVER_ERROR
        message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR]
    }

    res.locals.errorMessage = err.message

    const response = {
        code: statusCode,
        message,
        ...(envVars.env === "development" && { stack: err.stack }),
    }

    if (envVars.env === "development") {
        logger.error(err)
    }

    res.status(statusCode).send(response)
}

const error = {
    errorConverter,
    errorHandler,
}

export default error
