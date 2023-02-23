import express from "express"
import authRoute from "./auth"
import userRoute from "./user"
import docsRoute from "./docs"
import { envVars } from "@config"
const router = express.Router()

const defaultRoutes = [
    {
        path: "/auth",
        route: authRoute,
    },
    {
        path: "/users",
        route: userRoute,
    },
]

const devRoutes = [
    // routes available only in development mode
    {
        path: "/docs",
        route: docsRoute,
    },
]

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

/* istanbul ignore next */
if (envVars.env === "development") {
    devRoutes.forEach((route) => {
        router.use(route.path, route.route)
    })
}

export default router
