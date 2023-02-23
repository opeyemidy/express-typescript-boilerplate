import {
    Strategy as JwtStrategy,
    ExtractJwt,
    VerifiedCallback,
} from "passport-jwt"
import envVars from "./envVars"
import TokenEnum from "./tokens"
import { User } from "../models"

const jwtOptions = {
    secretOrKey: envVars.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
}

const jwtVerify = async (
    payload: { type: TokenEnum; sub: string },
    done: VerifiedCallback
) => {
    try {
        if (payload.type !== TokenEnum.ACCESS) {
            throw new Error("Invalid token type")
        }
        const user = await User.findById(payload.sub)
        if (!user) {
            return done(null, false)
        }
        done(null, user)
    } catch (error) {
        done(error, false)
    }
}

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify)

export default jwtStrategy
