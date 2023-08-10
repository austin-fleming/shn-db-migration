import { PostEntity } from "../../common/model/post.entity";
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

const listIds = async (max: number): Promise<Result<{id: string, type: string}[]>> => {
    try {
        return repoClient
            .fetch<{id: string, type: string}[]>(
                `
                *[_type == "quickquotes" && !(_id in path("drafts.**"))] 
                | order(_createdAt asc)[0...${max}] 
                {
                    "id": _id, 
                    "type": _type
                }
                `
            )
            .then((response) =>
                result.ok(response)
            )
    } catch (err) {
        return result.fail(new Error(`|> listIds: Failed to fetch quickquote ids:\n${err}`))
    }
}

const findById = async (id: string): Promise<Result<QuickquoteDTO>> => {
    try {
        return repoClient
            .fetch<QuickquoteDTO>(`
                *[_type == "quickquotes" && _id == "${id}"][0]
                {
                    ...,
                    author->
                }
            `)
            .then((quickquote) =>
                result.ok(quickquote)
            )
    } catch (err) {
        return result.fail(new Error(`|> Failed to fetch quickquote with id "${id}":\n${err}`))
    }
}

export const quickquoteRepo = {
    listIds,
    findById
}