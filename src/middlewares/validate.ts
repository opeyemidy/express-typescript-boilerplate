import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status"
import Joi from "joi"
import { ApiError, pick } from "utils"

const validate =
    (schema: object) => (req: Request, res: Response, next: NextFunction) => {
        const validSchema = pick(schema, ["params", "query", "body"])
        const object = pick(req, Object.keys(validSchema))
        const { value, error } = Joi.compile(validSchema)
            .prefs({ errors: { label: "key" }, abortEarly: false })
            .validate(object)

        if (error) {
            const errorMessage = error.details
                .map((details) => details.message)
                .join(", ")
            return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage))
        }
        Object.assign(req, value)
        return next()
    }
export default validate
