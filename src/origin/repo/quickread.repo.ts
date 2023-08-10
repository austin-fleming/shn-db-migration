import { Either, EitherAsync, Left, Right } from "purify-ts";
import { PostEntity } from "../../common/model/post.entity";
import { Result, result } from "../../lib/result";
import { AuthorType, BodyType, CardBodyType, FigureType, PostSeoType, SlugType } from "./fragments.dto";
import { quickreadMapper } from "./quickread.mapper";
import { repoClient } from "./repo_client";

export type QuickreadDTO = {
    _type: "quickreads",
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
        _type: "cardseries",
        _id: string,
        _rev: string,
        _updatedAt: string,
        _createdAt: string,
        title: string,
        slug: SlugType,
    },
    colorpaletteclassname: 
        | '--black'
        | '--light-blue'
        | '--dark-blue' 
        | '--bronze' 
        | '--dark-brown' 
        | '--light-gray' 
        | '--medium-gray' 
        | '--dark-gray' 
        | '--light-green' 
        | '--dark-green' 
        | '--light-pink' 
        | '--dark-pink' 
        | '--light-purple' 
        | '--dark-purple' 
        | '--white' 
        | '--light-yellow'
    ,
    mainimage?: FigureType,
    cards: Array<{
        _type: "card",
        _key: string,
        body: CardBodyType,
        citation?: string,
    }>,
    body?: BodyType,
    summary?: string,
    postSeo: PostSeoType,
    aliases?: string[],
}

const listIds = async (max: number): Promise<Result<{id: string, type: string}[]>> => {
    try {
        return repoClient
            .fetch<{id: string, type: string}[]>(`
                *[_type == "quickreads" && !(_id in path("drafts.**"))]
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
        return result.fail(new Error(`|> Failed to fetch quickread ids: ${err}`))
    }
}

const findById = async (id: string): Promise<Result<QuickreadDTO>> => {
    try {
        return repoClient
            .fetch<QuickreadDTO>(`
                *[_type == "quickreads" && _id == "${id}"]
                [0]
                {
                    ...,
                    author->,
                    series->
                }
            `)
            .then((quickread) =>
                result.ok(quickread)
            )
    } catch (err) {
        return result.fail(new Error(`|> Failed to fetch quickread with id "${id}": ${err}`))
    }
}

/* const alsoFind = (id: string): EitherAsync<Error, PostEntity> => EitherAsync(async ({liftEither}) => {
    try {
        const outcome = await repoClient.fetch<PostEntity>(``)

        return liftEither( Right(outcome))
    } catch (err) {
        return liftEither( Left(new Error(`|> Failed to fetch quickread with id "${id}": ${err}`)))
    }
})

const find2 = (id: string): EitherAsync<Error, PostEntity> => EitherAsync(async ({liftEither}) => 
    repoClient
        .fetch<PostEntity>(``)
        .then(outcome => liftEither(Right(outcome)))
        .catch(err => liftEither(Left(new Error(`|> Failed to fetch quickread with id "${id}": ${err}`))))
 */
// const outcome = alsoFind('test').chain(response => alsoFind(response.id)).map((post => post)).run()

export const quickreadRepo = {
    listIds,
    findById
}