/* eslint-disable indent */
import { roleRights } from "@config"
import { Request, Response } from "express"
import httpStatus from "http-status"
import passport from "passport"
import { ApiError } from "utils"

const verifyCallback =
    (
        req: Request & { user?: object },
        resolve: (value?: unknown) => void,
        reject: (pram: unknown) => void,
        requiredRights: string[]
    ) =>
    async (err: Error, user?: { role: string; id: string }, info?: string) => {
        if (err || info || !user) {
            return reject(
                new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate")
            )
        }
        req.user = user

        if (requiredRights.length) {
            const userRights = roleRights.get(user.role)
            const hasRequiredRights = requiredRights.every((requiredRight) =>
                userRights.includes(requiredRight)
            )
            if (!hasRequiredRights && req.params.userId !== user.id) {
                return reject(new ApiError(httpStatus.FORBIDDEN, "Forbidden"))
            }
        }

        resolve()
    }

const auth =
    (...requiredRights: string[]) =>
    async (req: Request, res: Response, next: (param?: unknown) => unknown) => {
        return new Promise((resolve, reject) => {
            passport.authenticate(
                "jwt",
                { session: false },
                verifyCallback(req, resolve, reject, requiredRights)
            )(req, res, next)
        })
            .then(() => next())
            .catch((err) => next(err))
    }

export default auth
