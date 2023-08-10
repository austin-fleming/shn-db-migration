import { PostEntity } from "../../common/model/post.entity";
import { Result, result } from "../../lib/result";
import { WpPostCreateDTO } from "../dto/types.dto";

type PostCreateData = {
    post: WpPostCreateDTO,
    meta: {
        originalUrl: string[],
        aliasUrls: string[],
    }
}

const postToDto = async (entity: PostEntity): Promise<Result<WpPostCreateDTO>> => {
    try {
        const createdPost: WpPostCreateDTO = {
            title: entity.title,
            content: entity.body,
            date: entity.createdAtTimezone,
            modified: entity.updatedAtTimezone,
            //tags: tags,
            //categories: categories,
            //featured_media: featured_media,
            //author: author,
            //excerpt: excerpt,
            //slug: slug,
            status: entity.isPublished ? 'publish' : 'draft',
        }
            
        return result.ok(createdPost)
    } catch (err: unknown) {
        return result.fail(new Error(`|> Failed to map post to dto: ${err}`))
    }
}

export const postMapper = {
    postToDto
}