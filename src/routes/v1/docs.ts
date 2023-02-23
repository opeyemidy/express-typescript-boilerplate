import swaggerDef from "docs/swaggerDef"
import express from "express"
import { RequestHandler } from "express"
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
const router = express.Router()

const options = {
    definition: swaggerDef,
    apis: ["src/docs/*.yml", "src/routes/v1/*.ts"],
}
const specs = swaggerJsdoc(options)

router.use(
    "/",
    swaggerUi.serve as unknown as RequestHandler<
        object,
        unknown,
        unknown,
        unknown,
        Record<string, unknown>
    >
)
router.get(
    "/",
    swaggerUi.setup(specs, {
        explorer: true,
    }) as unknown as RequestHandler<
        object,
        unknown,
        unknown,
        unknown,
        Record<string, unknown>
    >
)

export default router
