import { PostEntity } from "../../common/post.entity";
import { Result, result } from "../../lib/result";
import { isString } from "../../lib/validators/is-string";
import { bodyTextToHtml } from "./utils/body-text-to-html";
import { parseSanityAssetId } from "./utils/parse-sanity-asset-id";
import { createTemporaryMediaId } from "./utils/temporary-media-id";
import { VideopostDTO } from "./videopost.repo";

const dtoToPost = (videopost: VideopostDTO): Result<PostEntity> => {
    try {
        const id = videopost._id;
        if (!isString(id)) 
            throw new Error(`|> "_id" was "${id}"; expected a string.`)

        const isPublished = !id.startsWith("drafts.")

        const title = videopost.title;
        if (!isString(title))
            throw new Error(`|> "title" was "${title}"; expected a string.`)

        const slug = videopost.slug?.current;
        if (!isString(slug))
            throw new Error(`|> "slug.current" was "${slug}"; expected a string.`)

        const originalUrl = `https://smarthernews.com/videoposts/${slug}`

        const updatedAtTimezone = videopost._updatedAt;
        if (!isString(updatedAtTimezone))
            throw new Error(`|> "_updatedAt" was "${updatedAtTimezone}"; expected a string.`)

        const updatedAtGMT = new Date(updatedAtTimezone).toUTCString();
        
        const createdAtTimezone = videopost._createdAt;
        if (!isString(createdAtTimezone))
            throw new Error(`|> "_createdAt" was "${createdAtTimezone}"; expected a string.`)

        const createdAtGMT = new Date(createdAtTimezone).toUTCString();
        
        const publishedAtTimezone = videopost.datePublished;
        if (!isString(publishedAtTimezone))
            throw new Error(`|> "datePublished" was "${publishedAtTimezone}"; expected a string.`)

        const publishedAtGMT = new Date(publishedAtTimezone).toUTCString();

        const author = videopost.author;
        const authorId = author?._id;
        const authorName = author?.title;
        const authorSlug = author?.slug?.current;
        if (authorId && !isString(authorName))
            throw new Error(`|> "author.title" was "${authorName}"; expected a string.`)
        if (authorId && !isString(authorSlug))
            throw new Error(`|> "author.slug.current" was "${authorSlug}"; expected a string.`)

        // combine tags and series into one array, then ensure all are lowercase
        const originalTags = videopost.tags ? videopost.tags.map(tag => tag.label) : []
        const originalSeries = videopost.series?.title ? [videopost.series.title] : []
        const combinedTags = [...originalTags, ...originalSeries]
        const formattedTags = combinedTags.map(tag => tag.toLowerCase())

        let coverImage: PostEntity["coverImage"] | undefined = undefined;
        if (videopost.mainimage) {
            const {id, width, height} = parseSanityAssetId(videopost.mainimage?.asset?._ref).unwrapOrThrow()
            const alt = videopost.mainimage?.alt || title;
            
            coverImage = {
                url: createTemporaryMediaId(id),
                width,
                height,
                alt
            }
        }

        const serializedBody = bodyTextToHtml(videopost.body).unwrapOrThrow()

        const summary = videopost.summary

        let seoImage = coverImage
        if (videopost.postSeo?.image) {
            const {id, width, height} = parseSanityAssetId(videopost.postSeo?.image?.asset?._ref).unwrapOrThrow()

            seoImage = {
                url: createTemporaryMediaId(id),
                width,
                height,
                alt: ''
            }
        }

        const post: PostEntity = {
            id,
            title,
            slug,
            updatedAtTimezone,
            updatedAtGMT,
            createdAtTimezone,
            createdAtGMT,
            publishedAtTimezone,
            publishedAtGMT,
            author: (authorId && authorName && authorSlug)
                ? {
                    id: authorId,
                    name: authorName,
                    slug: authorSlug,
                } : undefined,
            tags: combinedTags,
            isPublished,
            coverImage: coverImage || undefined,
            body: serializedBody,
            seo: {
                originalUrl,
                description: videopost.postSeo?.description || summary || undefined,
                image: seoImage,
            },
        }

        return result.ok(post)
    } catch (err) {
        return result.fail(new Error(`|> Failed to map videopost to post: ${err}`))
    }
}

export const videopostMapper = {
    dtoToPost
}