import { PostEntity } from "../../common/post.entity";
import { Result, result } from "../../lib/result";
import { quickquoteRepo } from "./quickquote.repo";
import { quickreadRepo } from "./quickread.repo";
import { videopostRepo } from "./videopost.repo";

const listIds = async (max: number): Promise<Result<{id: string, type: string}[]>> => {
    try {
        const idLists = await Promise.all([
            (await quickquoteRepo.listIds(max)).unwrapOrThrow(),
            (await quickreadRepo.listIds(max)).unwrapOrThrow(),
            (await videopostRepo.listIds(max)).unwrapOrThrow()
        ])

        return result.ok(idLists.flat())
    } catch (err) {
        return result.fail(new Error(`|> Failed to fetch post ids: ${err}`))
    }
}

const findById = async (id: {id: string, type: string}): Promise<Result<PostEntity>> => {
    try {
        if ()

    } catch (err) {
        return result.fail(new Error(`|> Failed to fetch post with id "${id}": ${err}`))
    }
}