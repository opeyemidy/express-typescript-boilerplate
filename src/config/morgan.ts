import morganPkg from "morgan"
import { ServerResponse, IncomingMessage } from "http"
import envVars from "./envVars"
import logger from "./logger"

morganPkg.token(
    "message",
    (
        req,
        res: ServerResponse<IncomingMessage> & {
            locals: {
                errorMessage: string
            }
        }
    ) => res.locals.errorMessage || ""
)

const getIpFormat = () =>
    envVars.env === "production" ? ":remote-addr - " : ""
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`

const successHandler = morganPkg(successResponseFormat, {
    skip: (req, res) => res.statusCode >= 400,
    stream: { write: (message) => logger.info(message.trim()) },
})

const errorHandler = morganPkg(errorResponseFormat, {
    skip: (req, res) => res.statusCode < 400,
    stream: { write: (message) => logger.error(message.trim()) },
})

const morgan = {
    successHandler,
    errorHandler,
}
export default morgan
