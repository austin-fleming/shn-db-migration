import { PostEntity } from "../../common/post.entity";
import { Result, result } from "../../lib/result";
import { AuthorType, BodyType, FigureType, PostSeoType, SlugType } from "./fragments.dto";
import { quickquoteMapper } from "./quickquote.mapper";
import { repoClient } from "./repo_client";

export type QuickquoteDTO = {
    _type: "quickquotes",
    _id: string,
    _rev: string,
    _updatedAt: string, 
    _createdAt: string, 
    title: string,
    slug: SlugType,
    datePublished: string,
    lastModified?: string,
    author?: AuthorType,
    tags?: Array<{
        _key: string,
        label: string,
        value: string
    }>,
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
        ...,
        author->,
        mainimage,
        featured_quote
    }
`

const getQuickquote = async (id: string): Promise<Result<QuickquoteDTO>> => {
    try {
        return repoClient
            .fetch<QuickquoteDTO>(`*[_type == "quickquotes" && _id == "${id}"][0] ${quickquoteQuery}`)
            .then((quickquote) =>
                result.ok(quickquote)
            )
    } catch (err) {
        return result.fail(new Error(`|> Failed to fetch quickquote with id "${id}": ${err}`))
    }
}

const getQuickquoteAsPost = async (id: string): Promise<Result<PostEntity>> => 
    (await getQuickquote(id))
        .chainOk(quickquoteMapper.dtoToPost)

export const quickquoteRepo = {
    getQuickquote,
    getQuickquoteAsPost
}