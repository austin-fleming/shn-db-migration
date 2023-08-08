import { PostEntity } from "../../common/post.entity";
import { Result, result } from "../../lib/result";
import { isDateString } from "../../lib/validators/is-date-string";
import { isString } from "../../lib/validators/is-string";
import { QuickreadDTO } from "./quickread.repo";
import { parseSanityAssetId } from "./utils/parse-sanity-asset-id";
import { createTemporaryMediaId } from "./utils/temporary-media-id";
import { bodyTextToHtml } from "./utils/body-text-to-html";

const dtoToPost = (quickread: Partial<QuickreadDTO>): Result<PostEntity> => {
    try {
        const id = quickread._id;
        if (!isString(id)) throw new Error(`|> "_id" was "${id}"; expected a string.`)

        const isPublished = !id.startsWith("drafts.")

        const title = quickread.title;
        if (!isString(title)) throw new Error(`|> "title" was "${title}"; expected a string.`)

        const slug = quickread.slug?.current;
        if (!isString(slug)) throw new Error(`|> "slug.current" was "${slug}"; expected a string.`)

        const originalUrl = `https://smarthernews.com/quickreads/${slug}`

        const updatedAtTimezone = quickread._updatedAt;
        if (!isString(updatedAtTimezone) || !isDateString(updatedAtTimezone)) throw new Error(`|> "_updatedAt" was "${updatedAtTimezone}"; expected a string.`)

        const updatedAtGMT = new Date(updatedAtTimezone).toUTCString();

        const createdAtTimezone = quickread._createdAt;
        if (!isString(createdAtTimezone) || !isDateString(createdAtTimezone)) throw new Error(`|> "_createdAt" was "${createdAtTimezone}"; expected a string.`)

        const createdAtGMT = new Date(createdAtTimezone).toUTCString();

        const publishedAtTimezone = quickread.datePublished;
        if (!isString(publishedAtTimezone) || !isDateString(publishedAtTimezone)) throw new Error(`|> "datePublished" was "${publishedAtTimezone}"; expected a string.`)

        const publishedAtGMT = new Date(publishedAtTimezone).toUTCString();

        const serializedBody = quickread.body ? bodyTextToHtml(quickread.body).unwrapOrThrow() : ''

        const author = quickread.author;
        const authorId = author?._id;
        const authorName = author?.title;
        const authorSlug = author?.slug?.current;
        if (authorId && !isString(authorName)) throw new Error(`|> "author.title" was "${authorName}"; expected a string.`)
        if (authorId && !isString(authorSlug)) throw new Error(`|> "author.slug.current" was "${authorSlug}"; expected a string.`)


        // combine tags and series into one array, then ensure all are lowercase
        const originalTags = quickread.tags ? quickread.tags.map(tag => tag.label) : []
        const originalSeries = quickread.series?.title ? [quickread.series.title] : []
        const combinedTags = [...originalTags, ...originalSeries]
        const formattedTags = combinedTags.map(tag => tag.toLowerCase())

        let coverImage: PostEntity["coverImage"] | undefined = undefined;
        if (quickread.mainimage) {
            const {id, width, height} = parseSanityAssetId(quickread.mainimage?.asset?._ref).unwrapOrThrow()
            const alt = quickread.mainimage?.alt || title;

            coverImage = {
                url: createTemporaryMediaId(id),
                alt,
                width: width,
                height: height
            }
        }

        const cards = quickread.cards;
        if (!Array.isArray(cards)) throw new Error(`|> "cards" was "${cards}"; expected an array.`)
        if (!cards.length) throw new Error(`|> "cards" was empty; expected an array with at least one element.`)

        // TODO: combine together and merge with body. Wrap each in a div with a usable class.
        const compiledCards = cards.map((card, index) => {
            const serializedCard = bodyTextToHtml(card.body).unwrapOrThrow()

            return`
            <!-- wp:group {"className":"quickread-card"} -->
                <div class="wp-block-group quickread-card">
                    ${serializedCard}
                </div>
            <!-- /wp:group -->
            `
        })

        

        // TODO: figure out how to stich these together.
        const compiledBody = `${compiledCards}\n${serializedBody}`

        const summary = quickread.summary;

        const postSeo = quickread.postSeo;
        const seoDescription = postSeo?.description || summary || undefined;

        let seoImage = coverImage;
        if (postSeo?.image) {
            const {id, width, height} = parseSanityAssetId(postSeo.image.asset._ref).unwrapOrThrow()
            

            seoImage = {
                url: createTemporaryMediaId(id),
                alt: '',
                width: width,
                height: height
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
            author: (authorId && authorName && authorSlug) ? {
                id: authorId,
                name: authorName,
                slug: authorSlug,
            } : undefined,
            tags: formattedTags,
            isPublished,
            coverImage,
            body: compiledBody,
            seo: {
                originalUrl,
                description: seoDescription,
                image: seoImage,
            }
        }

        return result.ok(post)
    } catch (err) {
        return result.fail(new Error(`|> Failed to map quickread with id "${quickread?._id}" to post: ${err}`))
    }
}

export const quickreadMapper = {
    dtoToPost
}