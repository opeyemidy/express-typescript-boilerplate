import express, { RequestHandler } from "express"
import helmet from "helmet"
import xss from "xss-clean"
import mongoSanitize from "express-mongo-sanitize"
import compression from "compression"
import cors from "cors"
import httpStatus from "http-status"
import passport from "passport"
import { envVars, jwtStrategy, morgan } from "@config"
import { authLimiter, error } from "middlewares"
import { ApiError } from "utils"
import routes from "routes/v1"
const app = express()
const { errorConverter, errorHandler } = error
if (envVars.env !== "test") {
    app.use(morgan.successHandler)
    app.use(morgan.errorHandler)
}

// set security HTTP headers
app.use(helmet())

// parse json request body
app.use(express.json())

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }))

// sanitize request data
app.use(xss())
app.use(mongoSanitize())

// gzip compression
app.use(compression())

// enable cors
app.use(cors())
app.options(
    "*",
    cors() as RequestHandler<
        object,
        unknown,
        unknown,
        unknown,
        Record<string, unknown>
    >
)

// jwt authentication
app.use(passport.initialize())
passport.use("jwt", jwtStrategy)

// limit repeated failed requests to auth endpoints
if (envVars.env === "production") {
    app.use(
        "/v1/auth",
        authLimiter as RequestHandler<
            object,
            unknown,
            unknown,
            unknown,
            Record<string, unknown>
        >
    )
}

// v1 api routes
app.use("/v1", routes)

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, "Not found"))
})

// convert error to ApiError, if needed
app.use(errorConverter)

// handle error
app.use(errorHandler)

export default app
