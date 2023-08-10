import { EitherAsync, Left, Right } from "purify-ts";
import { PostEntity } from "../../common/model/post.entity";
import { mediaRepo } from "./media.repo";
import { extractTemporaryMediaId, findTemporaryMediaIds, replaceTemporaryMediaIds } from "../../common/utils/temporary-media-id";
import { constructImageUrl } from "../../existing/repo/utils/construct-image-url";
import { errorFromUnknown } from "../../lib/error-handling/error-from-unknown";
import { tagRepo } from "./tag.repo";
import { errorFromMessage } from "../../lib/error-handling/error-from-message";

type IntermediatePost = Omit<PostEntity, 'coverImage' | 'tags' | 'author' | 'seo'> & {
    coverImage?: {
        id: number,
        url: string
    },
    tags: number[],
    author?: number,
    seo: Omit<PostEntity['seo'], 'image'> & {
        image?: {
            id: number,
            url: string
        }
    }
}

const extractAndUploadImageData = (mediaDescription: {url: string, alt: string, width?: number, height?: number}): EitherAsync<Error, {id: number, url: string}> => 
    EitherAsync(async ({liftEither}) => {
        try {
            const extractedId = 
                extractTemporaryMediaId(mediaDescription.url)
                    .ifLeft(error => {
                        throw error
                    })
                    .unsafeCoerce() 

            const mediaUrl = constructImageUrl(extractedId)

            const uploadedMediaResult = await mediaRepo
                .upload({
                    fileName: extractedId,
                    url: mediaUrl,
                    alt: mediaDescription.alt
                })
                .run()

            const {id, source_url} = uploadedMediaResult
                .ifLeft(error => {
                    throw error
                })
                .unsafeCoerce() 
                
            return liftEither(Right({id, url: source_url}))
        } catch (err) {
            return liftEither(Left(errorFromUnknown(err, `extractAndUploadImageData Failed to upload image "${mediaDescription.url}"`)))
        }
    })

const replaceBodyImages = (body: PostEntity['body']): EitherAsync<Error, PostEntity['body']> =>
    EitherAsync(async ({liftEither}) => {
        try {
            const bodyImages = findTemporaryMediaIds(body)

            const uploadedImages = 
                await Promise.all(
                    bodyImages
                    .map(async (id) => 
                        extractAndUploadImageData({
                            url: id,
                            alt: '',
                        })
                        .run()
                        .then(result =>
                            result
                                .ifLeft(error => {
                                    throw error
                                })
                                .unsafeCoerce()   
                        )
                    )
                )

            const bodyWithImagesReplaced = 
                replaceTemporaryMediaIds(
                    body, 
                    uploadedImages
                        .reduce((acc, {id, url}) => 
                            ({...acc, [id]: url}), 
                            {}
                        )
                )
            
            return liftEither(Right(bodyWithImagesReplaced))
        } catch (err) {
            return liftEither(Left(errorFromUnknown(err, `Failed to replace body images`)))

        }
    })

export const genericToIntermediate = (post: PostEntity): EitherAsync<Error, IntermediatePost> =>
    EitherAsync(async ({liftEither}) => {
        try {
            const body = 
                await replaceBodyImages(post.body)
                    .run()
                    .then(result =>
                        result
                            .ifLeft(error => {
                                throw errorFromUnknown(error, `Failed to replace body images`)
                            })
                            .unsafeCoerce() 
                    )

            const coverImage = 
                post.coverImage 
                && await extractAndUploadImageData(post.coverImage)
                    .run()
                    .then(result => 
                        result
                            .ifLeft(error => {
                                throw errorFromUnknown(error, `Failed to upload cover image "${post.coverImage?.url}"`)
                            })
                            .unsafeCoerce() 
                    )

            const seoImage =
                post.seo.image
                && await extractAndUploadImageData(post.seo.image)
                    .run()
                    .then(result =>
                        result
                            .ifLeft(error => {
                                throw errorFromUnknown(error, `Failed to upload seo image "${post.seo.image?.url}"`)
                            })
                            .unsafeCoerce() 
                    )

            const tags =
                post.tags
                    ? await tagRepo
                        .putListByName(post.tags)
                        .run()
                        .then(result =>
                            result
                                .ifLeft(error => {
                                    throw errorFromUnknown(error, `Failed to put list of tags in intermediate "${post.tags}"`)
                                })
                                .unsafeCoerce() 
                        )
                        .then(tags => 
                            tags.map(tag => tag.id)
                        )
                    : []

            const author = undefined // TODO: find how to override author
        
            return liftEither(Right({
                ...post,
                author,
                coverImage,
                seo: {
                    ...post.seo,
                    image: seoImage
                },
                tags,
                body
            }))
        } catch (err) {
            return liftEither(Left(errorFromUnknown(err, `Failed to map post with id "${post.id}"`)))
        }
    })