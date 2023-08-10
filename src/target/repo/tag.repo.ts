import { errorFromUnknown } from "../../lib/error-handling/error-from-unknown"
import { Result, result } from "../../lib/result"
import { isNumber } from "../../lib/validators/is-number"
import { isObject } from "../../lib/validators/is-object"
import { isString } from "../../lib/validators/is-string"
import { WpRestErrorDTO, WpTagDTO, WpTagDeletedDTO } from "../dto/types.dto"
import { repoClient } from "./repo_client"

const getTag = async (tagId: number): Promise<Result<WpTagDTO>> => {
    try {
        const response: WpTagDTO = await repoClient.tags().id(tagId).get()

        return result.ok(response)
    } catch (err: unknown) {
        return result.fail(errorFromUnknown(err, `Failed to get tag "${tagId}"`))
    }
}

const createTag = async (tag: {name: string}): Promise<Result<WpTagDTO>>  => {
    try {
        const response: WpTagDTO = await repoClient.tags().create(tag) 

        return result.ok(response)
    } catch (err: unknown) {
        if (isObject(err) && err?.code === "term_exists") {
            return result.fail(errorFromUnknown(err, `Tag "${tag}" already exists`))
        }

        return result.fail(errorFromUnknown(err, `Failed to write tag "${tag}"`))
    }
}

const putTag = async (tag: {name: string}): Promise<Result<WpTagDTO>> => {
    try {
        const response: WpTagDTO = await repoClient.tags().create(tag)

        return result.ok(response)
    } catch (err: unknown) {
        // NOTE: if the error isn't a "term_exists" error with accompanying "term_id" that can be parsed, fail
        // These checks might look neurotic, but this isn't the place to be throwing cryptic errors
        if (!isObject(err) || err?.code !== "term_exists") {
            return result.fail(errorFromUnknown(err, `Failed to write or find existing tag "${tag}"`))
        }

        if ( !isObject(err?.data) || !(isNumber(err?.data?.term_id) || isString(err?.data?.term_id)) ) {
            return result.fail(errorFromUnknown(err, `Existing tag "${tag}" was found, but no usable ID was provided in error`))
        }

        const existingTagId = isNumber(err.data.term_id) ? err.data.term_id : parseInt(err.data.term_id, 10)
        const existingTagResult: Result<WpTagDTO> = await repoClient
            .tags()
            .id(existingTagId)
            .get()
            .then((tagResponse: WpTagDTO): Result<WpTagDTO> => result.ok(tagResponse))
            .catch((err: WpRestErrorDTO): Result<WpTagDTO> => 
                result.fail(errorFromUnknown(err, `Could not create or find the tag "${tag.name}". Expected to find existing tag with id "${existingTagId}", but no results returned`))
            )

        return existingTagResult
    }
}

const putTags = async (tags: string[]): Promise<Result<WpTagDTO[]>> => {
    try {
        const tagsResults = await Promise.all(
            tags.map(async (tag) => 
                putTag({name: tag})
            )
        )

        return result.sequence(tagsResults)
    } catch (err: unknown) {
        return result.fail(errorFromUnknown(err, `Failed to write tags "${tags}"`))
    }
}

const deleteTag = async (tagId: number): Promise<Result<WpTagDeletedDTO>> => {
    try {
        const response: WpTagDeletedDTO = await repoClient
            .tags()
            .id(tagId)
            .delete({
                force: true // NOTE: force is required to delete tags
            })

        return result.ok(response)
    } catch (err: unknown) {
        return result.fail(errorFromUnknown(err, `Failed to delete tag "${tagId}"`))
    }
}

export const tagRepo ={
    getTag,
    createTag,
    putTag,
    putTags,
    deleteTag,
}