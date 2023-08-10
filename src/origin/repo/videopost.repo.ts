import { Result, result } from "../../lib/result";
import { AuthorType, BodyType, FigureType, PostSeoType, SlugType } from "./fragments.dto";
import { repoClient } from "./repo_client";

export type VideopostDTO = {
    _type: "videoposts",
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
    series: {
        _type: "videoseries",
        _id: string,
        _rev: string,
        _updatedAt: string,
        _createdAt: string,
        title: string,
        slug: SlugType,
    },
    mainimage?: FigureType,
    body: BodyType,
    summary?: string,
    postSeo?: PostSeoType,
}

const listIds = async (max: number): Promise<Result<{id: string, type: string}[]>> => {
    try {
        return repoClient
            .fetch<{id: string, type: string}[]>(`
                *[_type == "videoposts" && !(_id in path("drafts.**"))]
                | order(_createdAt asc) 
                [0...${max}]
                {
                    "id": _id,
                    "type": _type
                }
            `)
            .then((ids) =>
                result.ok(ids)
            )
    } catch (err) {
        return result.fail(new Error(`|> Failed to fetch videopost ids:\n${err}`))
    }
}

const findById = async (id: string): Promise<Result<VideopostDTO>> => {
    try {
        return repoClient
            .fetch<VideopostDTO>(`
                *[_type == "videoposts" && _id == "${id}"]
                [0]
                {
                    ...,
                    author->,
                    series->
                }    
            `)
            .then((videopost) =>
                result.ok(videopost)
            )
    } catch (err) {
        return result.fail(new Error(`|> Failed to fetch videopost with id "${id}": ${err}`))
    }
}

export const videopostRepo = {
    listIds,
    findById
}