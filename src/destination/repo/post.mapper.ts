import { EitherAsync, Left, Right } from "purify-ts";
import { PostEntity } from "../../common/types/post.entity";
import { WpPostCreateDTO } from "./types.dto";
import { errorFromUnknown } from "../../lib/error-handling/error-from-unknown";
import { genericToIntermediate } from "./intermediate.mapper";

const postToDto = (post: PostEntity): EitherAsync<Error, WpPostCreateDTO> => 
    EitherAsync(async ({liftEither}) => {
        try {
            const {body, tags, coverImage } = 
                await genericToIntermediate(post)
                    .run()
                    .then(intermediatePost => 
                        intermediatePost
                            .ifLeft(error => {
                                throw errorFromUnknown(error, `Failed to do generic to intermediate mapping`)
                            })
                            .unsafeCoerce() 
                    )

            return liftEither(Right({
                title: post.title,
                content: body,
                date: post.createdAtTimezone,
                modified: post.updatedAtTimezone,
                ...(post.seo?.description && {excerpt: post.seo.description}),
                status: post.isPublished ? 'publish' : 'draft',
                tags,
                ...(coverImage && {featured_media: coverImage.id}),
            }))
        } catch (err: unknown) {
            return liftEither(Left(errorFromUnknown(err, `Failed to map post to destination dto`)))
        }
    })

export const postMapper = {
    postToDto
}