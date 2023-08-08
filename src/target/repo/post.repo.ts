import { Result, result } from "../../lib/result";
import { WpPostCreateDTO, WpPostDTO } from "../dto/types.dto";
import { repoClient } from "./repo_client";

const createPost = async (post: WpPostCreateDTO): Promise<Result<WpPostDTO>> => {
    try {
        const response: WpPostDTO = await repoClient.posts().create(post)

        return result.ok(response)
    } catch (err: unknown) {
        return result.fail(new Error(`|> Failed to write post with title "${post.title}": ${err}`))
    }
}

const deletePost = async (postId: number): Promise<Result<WpPostDTO>> => {
    try {
        const response: WpPostDTO = await repoClient.posts().id(postId).delete()

        return result.ok(response)
    } catch (err: unknown) {
        return result.fail(new Error(`|> Failed to delete post with id "${postId}": ${err}`))
    }
}

const updatePost = async (id: number, post: Partial<WpPostCreateDTO>): Promise<Result<WpPostDTO>> => {
    try {
        const response: WpPostDTO = await repoClient.posts().id(id).update(post)

        return result.ok(response)
    } catch (err: unknown) {
        return result.fail(new Error(`|> Failed to update post with id "${id}": ${err}`))
    }
}

export const postRepo = {
    createPost,
    deletePost,
    updatePost,
}