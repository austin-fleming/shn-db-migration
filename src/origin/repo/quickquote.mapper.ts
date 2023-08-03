import { PostEntity } from "../../common/post.entity";
import { Result, result } from "../../lib/result";
import { isDateString } from "../../lib/validators/is-date-string";
import { QuickquoteDTO } from "./quickquote.repo";

const mapQuickquoteToPost = (quickquote: QuickquoteDTO): Result<PostEntity> => {
    try {
        const id = quickquote._id;
        if (!id) throw new Error(`QuickQuote value "_id" was "${id}"; expected a string.`)

        const title = quickquote.title;
        if (!title) throw new Error(`QuickQuote value "title" was "${title}"; expected a string.`)

        const slug = quickquote.slug?.current;
        if (!slug) throw new Error(`QuickQuote value "slug.current" was "${slug}"; expected a string.`)

        const updatedAtTimezone = quickquote._updatedAt;
        if (!isDateString(updatedAtTimezone)) throw new Error(`QuickQuote value "_updatedAt" was "${updatedAtTimezone}"; expected a date string.`)

        const updatedAtGMT = new Date(updatedAtTimezone).toUTCString();

        const createdAtTimezone = quickquote._createdAt;
        if (!isDateString(createdAtTimezone)) throw new Error(`QuickQuote value "_createdAt" was "${createdAtTimezone}"; expected a date string.`)

        const createdAtGMT = new Date(createdAtTimezone).toUTCString();

        const publishedAtTimezone = quickquote.datePublished;
        if (!isDateString(publishedAtTimezone)) throw new Error(`QuickQuote value "datePublished" was "${publishedAtTimezone}"; expected a date string.`)

        const publishedAtGMT = new Date(publishedAtTimezone).toUTCString();

        const author = quickquote.author;
        const authorId = author?._id;
        const authorName = author?.title;
        const authorSlug = author?.slug?.current;
        if (authorId && !authorName) throw new Error(`QuickQuote value "author.title" was "${authorName}"; expected a string.`)
        if (authorId && !authorSlug) throw new Error(`QuickQuote value "author.slug.current" was "${authorSlug}"; expected a string.`)  

        const tags = quickquote.tags || [];

        const isPublished = id.startsWith("drafts.") ? false : true;

        // TODO: fetch image data from Sanity
        const coverImage = quickquote.mainimage;
        const coverImageUrl = coverImage?.asset?.url;
        const coverImageAlt = coverImage?.alt;
        const coverImageCaption = coverImage?.caption;
        const coverImageDescription = coverImage?.description;
        if (coverImage && !coverImageUrl) throw new Error(`QuickQuote value "mainimage.asset.url" was "${coverImageUrl}"; expected a string.`)

        // TODO: parse out body
        const body = quickquote.body;
        if (!body) throw new Error(`QuickQuote value "body" was "${body}"; expected an object.`)

        // NOTE: make sure to update category if duplicated
        const canonicalUrl = `https://smarthernews.com/quickquotes/${slug}`
        
        const seo = quickquote.postSeo;
        const seoTitle = seo?.title || title.slice(0, 75);
        const seoDescription = seo?.description; // TODO: get stringified body as fallback
        const seoImageUrl = coverImageUrl;
        const seoImageAlt = coverImageAlt;

        const aliases = quickquote.aliases;
        if (aliases && !Array.isArray(aliases)) throw new Error(`QuickQuote value "aliases" was "${aliases}"; expected an array.`)
        

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
            coverImage: {
                url: coverImageUrl,
                alt: coverImageAlt,
                caption: coverImageCaption,
                description: coverImageDescription,
            },
            body: {
                content: body,
                // TODO: populate
                images: []
            },
            seo: {
                canonicalUrl,
                title: seoTitle,
                description: seoDescription,
                image: seoImageUrl 
                    ? {
                        url: seoImageUrl,
                        alt: seoImageAlt,
                    } : undefined,
                aliases: aliases || undefined,
            },
        }

        return result.ok(post)
    } catch (err) {
        return result.fail(new Error(`Failed to convert quickquote with id "${quickquote?._id}" to post: ${err}`))
    }
}

export const quickquoteMapper = {
    mapQuickquoteToPost,
}