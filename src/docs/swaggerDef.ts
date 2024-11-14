import { envVars } from "@config"

const swaggerDef = {
    openapi: "3.0.0",
    info: {
        title: "node-express-typescript-boilerplate API documentation",
        version: "1.0.0",
        license: {
            name: "MIT",
            url: "https://github.com/hagopj13/node-express-boilerplate/blob/master/LICENSE",
        },
    },
    servers: [
        {
            url: `http://localhost:${envVars.port}/v1`,
        },
    ],
}

export default swaggerDef
