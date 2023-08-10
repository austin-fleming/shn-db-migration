import { AuthorType, BodyType, FigureType, PostSeoType, SlugType } from "./fragments.dto";

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