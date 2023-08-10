import { Either, Left, Right } from "purify-ts";
import { PostEntity } from "../../common/model/post.entity";
import { isDateString } from "../../lib/validators/is-date-string";
import { isString } from "../../lib/validators/is-string";
import { bodyTextToHtml } from "./utils/body-text-to-html";
import { parseSanityAssetId } from "./utils/parse-sanity-asset-id";
import { createTemporaryMediaId } from "../../common/utils/temporary-media-id";
import { errorFromUnknown } from "../../lib/error-handling/error-from-unknown";
import { QuickquoteDTO } from "./quickquote.dto";

const dtoToPost = (quickquote: QuickquoteDTO): Either<Error,PostEntity> => 
    {
        try {
            const id = quickquote._id;
            if (!id) 
                throw new Error(`"_id" was "${id}"; expected a string.`)

            const isPublished = !id.startsWith("drafts.")

            const title = quickquote.title;
            if (!title) 
                throw new Error(`"title" was "${title}"; expected a string.`)

            const slug = quickquote.slug?.current;
            if (!isString(slug)) 
                throw new Error(`"slug.current" was "${slug}"; expected a string.`)

            const originalUrl = `https://smarthernews.com/quickquotes/${slug}`
            
            const updatedAtTimezone = quickquote._updatedAt;
            if (!isString(updatedAtTimezone) || !isDateString(updatedAtTimezone)) 
                throw new Error(`"_updatedAt" was "${updatedAtTimezone}"; expected a string.`)

            const updatedAtGMT = new Date(updatedAtTimezone).toUTCString();

            const createdAtTimezone = quickquote._createdAt;
            if (!isString(createdAtTimezone) || !isDateString(createdAtTimezone)) 
                throw new Error(`"_createdAt" was "${createdAtTimezone}"; expected a string.`)

            const createdAtGMT = new Date(createdAtTimezone).toUTCString();

            const publishedAtTimezone = quickquote.datePublished;
            if (!isString(publishedAtTimezone) || !isDateString(publishedAtTimezone)) 
                throw new Error(`"datePublished" was "${publishedAtTimezone}"; expected a string.`)

            const publishedAtGMT = new Date(publishedAtTimezone).toUTCString();

            const author = quickquote.author;
            const authorId = author?._id;
            const authorName = author?.title;
            const authorSlug = author?.slug?.current;
            if (authorId && !authorName) 
                throw new Error(`"author.title" was "${authorName}"; expected a string.`)
            if (authorId && !authorSlug) 
                throw new Error(`"author.slug.current" was "${authorSlug}"; expected a string.`)  

            const tags = quickquote.tags?.map(tag => 
                    tag.label.toLowerCase()
                ) || [];

            let coverImage: PostEntity["coverImage"] | undefined = undefined;
            if (quickquote.mainimage) {
                const assetId = quickquote.mainimage?.asset?._ref;
                const {id, width, height, format} = parseSanityAssetId(assetId)
                    .ifLeft(error => {
                        throw error
                    })
                    .unsafeCoerce() 
                const alt = quickquote.mainimage?.alt || title;

                coverImage = {
                    url: createTemporaryMediaId(id, width, height, format),
                    alt,
                    width,
                    height
                }
            }

            if (!quickquote.featured_quote) 
                throw new Error(`"featured_quote" is missing.`)

            const {quote: quoteQuote, summary: quoteSummary, citation: quoteCitation} = quickquote.featured_quote;
            if (!quoteQuote)
                throw new Error(`"featured_quote.quote" is missing.`)
            
            const serializedQuote = `
                <!-- wp:quote -->
                <blockquote class="wp-block-quote">
                    <!-- wp:paragraph -->
                        <p>${quoteQuote}</p>
                    <!-- /wp:paragraph -->
                    ${quoteCitation ? `<cite>${quoteCitation}</cite>` : ''}
                </blockquote>
                <!-- /wp:quote -->
            `

            const serializedBody = bodyTextToHtml(quickquote.body)
                .ifLeft(error => {
                    throw error
                })
                .unsafeCoerce() 

            const formattedBody = `
                ${serializedQuote}
                ${serializedBody}
            `

            let seoImage = coverImage;
            if (quickquote.postSeo?.image) {
                const {id, width, height, format} = parseSanityAssetId(quickquote.postSeo?.image.asset._ref)
                    .ifLeft(error => {
                        throw error
                    })
                    .unsafeCoerce() 
                
                seoImage = {
                    url: createTemporaryMediaId(id, width, height, format),
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
                author: (authorId && authorName && authorSlug)
                    ? {
                        id: authorId,
                        name: authorName,
                        slug: authorSlug,
                    } : undefined,
                tags,
                isPublished,
                coverImage: coverImage || undefined,
                body: formattedBody,
                seo: {
                    originalUrl,
                    description: quickquote.postSeo?.description || quoteSummary || quoteQuote,
                    image: seoImage,
                },
            }

            return Right(post)
        } catch (err) {
            return Left(errorFromUnknown(err, `Failed to convert quickquote with id "${quickquote?._id}" to post`))
        }
    }

export const quickquoteMapper = {
    dtoToPost,
}