import dotenv from "dotenv"
import path from "path"
import envVarsSchema from "./schema"
import { ConnectOptions } from "mongoose"

dotenv.config({ path: path.join(__dirname, "../../../.env") })
const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: "key" } })
    .validate(process.env)
if (error) {
    throw new Error(`Config validation error: ${error.message}`)
}

const env = envVars.NODE_ENV
const port = envVars.PORT
const mongoose = {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === "test" ? "-test" : ""),
    options: {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions,
}
const jwt = {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
        envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
}
const email = {
    smtp: {
        host: envVars.SMTP_HOST,
        port: envVars.SMTP_PORT,
        auth: {
            user: envVars.SMTP_USERNAME,
            pass: envVars.SMTP_PASSWORD,
        },
    },
    from: envVars.EMAIL_FROM,
}

export default {
    env,
    port,
    mongoose,
    jwt,
    email,
}
