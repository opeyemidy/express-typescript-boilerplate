import app from "app"
import { envVars, logger } from "config"
import { IncomingMessage, Server, ServerResponse } from "http"
import mongoose from "mongoose"

let server: Server<typeof IncomingMessage, typeof ServerResponse>
mongoose.set("strictQuery", false)
mongoose.connect(envVars.mongoose.url).then(() => {
    logger.info("Connecteds to MongoDB")
    server = app.listen(envVars.port, () => {
        logger.info(`Listening to port ${envVars.port}`)
    })
})

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info("Server closed")
            process.exit(1)
        })
    } else {
        process.exit(1)
    }
}

const unexpectedErrorHandler = (error: Error) => {
    logger.error(error)
    exitHandler()
}

process.on("uncaughtException", unexpectedErrorHandler)
process.on("unhandledRejection", unexpectedErrorHandler)

process.on("SIGTERM", () => {
    logger.info("SIGTERM received")
    if (server) {
        server.close()
    }
})
