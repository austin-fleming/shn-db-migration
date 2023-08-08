import { PostEntity } from "../../common/post.entity";
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

const quickreadQuery = `
    {
        ...,
        author->,
        series->,
        body
    }
`

const getQuickread = async (id: string): Promise<Result<QuickreadDTO>> => {
    try {
        return repoClient
            .fetch<QuickreadDTO>(`*[_type == "quickreads" && _id == "${id}"][0] ${quickreadQuery}`)
            .then((quickread) =>
                result.ok(quickread)
            )
    } catch (err) {
        return result.fail(new Error(`|> Failed to fetch quickread with id "${id}": ${err}`))
    }
}

const getQuickreadAsPost = async (id: string): Promise<Result<PostEntity>> => 
    (await getQuickread(id))
        .chainOk(quickreadMapper.dtoToPost)

export const quickreadRepo = {
    getQuickread,
    getQuickreadAsPost,
}