import { NextFunction, Request, Response } from "express"
import { auth } from "../lib/auth";
import { UserRole } from "../types";




export const guard = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const session = await auth.api.getSession({ headers: req.headers as any })

        if (!session) {
            res.status(401).json({
                message: "You are not welcome"
            })
        }
        if (!session?.user.emailVerified) {
            res.status(403).json({
                message: "Email is not verified"
            })
        }

        req.user = {
            id: session?.user.id!,
            email: session?.user.email!,
            name: session?.user.name!,
            role: session?.user.role as string,
            emailVerified: session?.user.emailVerified!
        }
        if (roles.length && !roles.includes(req.user.role as UserRole)) {
            res.status(403).json({
                success: false,
                message: "Forbidden"
            })
        }
        next()
    }
}