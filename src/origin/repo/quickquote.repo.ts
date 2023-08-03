import { PostEntity } from "../../common/post.entity";
import { Result, result } from "../../lib/result";
import { isDateString } from "../../lib/validators/is-date-string";
import { AuthorType, BodyType, FigureType, PostSeoType, SlugType } from "./fragments.dto";
import { quickquoteMapper } from "./quickquote.mapper";
import { repoClient } from "./repo_client";

export type QuickquoteDTO = {
    _type: "quickquotes",
    _rev: string,
    _updatedAt: string, // TODO: Figure out what this is and assert
    _createdAt: string, // TODO: Figure out what this is and assert
    _id: string,
    title: string,
    slug: SlugType,
    datePublished: string, // TODO: Figure out what this is and assert
    lastModified?: string, // TODO: Figure out what this is and assert
    author?: AuthorType,
    tags: string[],
    is_breaking: boolean,
    mainimage?: FigureType,
    featured_quote: {
        quote: string,
        summary?: string,
        citation?: string
    },
    body: BodyType, // TODO: Figure out what this is
    postSeo?: PostSeoType,
    aliases: string[],
}

const quickquoteQuery = `
    {
        _type,
        _rev,
        _updatedAt,
        _createdAt,
        _id,
        title,
        slug,
        datePublished,
        lastModified,
        author->,
        tags,
        is_breaking,
        mainimage,
        featured_quote,
        body,
        postSeo,
        aliases
    }
`

const getQuickquote = async ({id}:{id: string}): Promise<Result<QuickquoteDTO>> => {
    try {
        return repoClient
            .fetch<QuickquoteDTO>(`*[_type == "quickquotes" && _id == "${id}"] ${quickquoteQuery}`)
            .then((quickquote) =>
                result.ok(quickquote)
            )
    } catch (err) {
        return result.fail(new Error(`Failed to fetch quickquote with id "${id}": ${err}`))
    }
}

const getQuickquotePost = async (id: string): Promise<Result<PostEntity>> => (await getQuickquote({id})).chainOk(quickquoteMapper.mapQuickquoteToPost)

export const quickquoteRepo = {
    getQuickquote,
    getQuickquotePost
}