import { Request, Response } from "express";
import { postService } from "./post.service";

const createPost = async (req: Request, res: Response) => {
    const userId = req.user?.id
    try {
        const result = await postService.createPost(req.body, userId as string)
        res.status(201).json({
            data: result
        })
    } catch (err: any) {
        res.status(404).json({
            message: err.message
        })
        console.log(err);
    }
}



export const postController = {
    createPost
}