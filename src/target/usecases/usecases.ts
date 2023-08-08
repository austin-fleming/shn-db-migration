import { Result, result } from "../../lib/result"
import { WpPostCreateDTO, WpPostDTO } from "../dto/types.dto"
import { postRepo } from "../repo/post.repo"
import { tagRepo } from "../repo/tag.repo"

const createPost = async (
    post: Omit<WpPostCreateDTO, 'tags'> & {tags: string[]} // NOTE: Change this to Post Entity
): Promise<Result<WpPostDTO>> => {
    try {
        const {tags, ...rest} = post;

        const tagIds = tags 
            ? (await tagRepo.putTags(tags))
                .mapOk((tags) => 
                    tags.map(tag => tag.id)
                )
                .unwrapOrThrow() 
            : []
        
        // TODO: categories
        // TODO: author
        // TODO: images
        
        const postWithReferences = {
            ...rest,
            tags: tagIds,
        }

        return postRepo.createPost(postWithReferences)
    } catch (err: unknown) {
        return result.fail(new Error(`|> Failed to write post with title "${post.title}": ${err}`))
    }
}


export const usecases = {
    createPost,
}