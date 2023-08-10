import { PostEntity } from "../../common/model/post.entity";
import { Result, result } from "../../lib/result";
import { quickquoteMapper } from "./quickquote.mapper";
import { quickquoteRepo } from "./quickquote.repo";
import { quickreadMapper } from "./quickread.mapper";
import { quickreadRepo } from "./quickread.repo";
import { videopostMapper } from "./videopost.mapper";
import { videopostRepo } from "./videopost.repo";

const listIds = async (max: number): Promise<Result<{id: string, type: string}[]>> => {
    try {
        let maxResults = max <= 3 ? 1 : Math.floor(max / 3)

        const idLists = await Promise.all([
            (await quickquoteRepo.listIds(maxResults)).unwrapOrThrow(),
            (await quickreadRepo.listIds(maxResults)).unwrapOrThrow(),
            (await videopostRepo.listIds(maxResults)).unwrapOrThrow()
        ])

        return result.ok(idLists.flat())
    } catch (err) {
        return result.fail(new Error(`|> listIds: Failed to fetch post ids:\n\t${err}`))
    }
}

const findById = async (id: {id: string, type: string}): Promise<Result<PostEntity>> => {
    try {
        if (id.type === 'quickquotes') 
            return (await quickquoteRepo.findById(id.id)).effectOk(value => {console.log(`|| ${value._type} || ${value.title}`)}).chainOk(quickquoteMapper.dtoToPost)

        if (id.type === 'quickreads')
            return (await quickreadRepo.findById(id.id)).effectOk(value => {console.log(`|| ${value._type} || ${value.title}`)}).chainOk(quickreadMapper.dtoToPost)

        if (id.type === 'videoposts')
            return (await videopostRepo.findById(id.id)).effectOk(value => {console.log(`|| ${value._type} || ${value.title}`)}).chainOk(videopostMapper.dtoToPost)

        return result.fail(new Error(`|> Failed to fetch post with id "${id.id}": Unknown post type "${id.type}"`))
    } catch (err) {
        return result.fail(new Error(`|> Failed to fetch post with id "${id}": ${err}`))
    }
}

export const originRepo = {
    listIds,
    findById
}
