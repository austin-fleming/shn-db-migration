import { AuthorType, BodyType, FigureType, PostSeoType, SlugType } from "./fragments.dto";

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