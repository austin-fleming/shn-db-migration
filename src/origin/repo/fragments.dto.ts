export type FigureType ={
    _type: "figure",
    alt: string,
    isContained?: boolean,
    asset: {
        _ref: string,
        _type: "reference"
    }
}

export type BasicImageType = {}

export type BodyType = {}

export type UrlType = string

export type PostSeoType = {
    _type: "postSeo",
    seoSchemaType: "newsArticle" | "article",
    title?: string,
    description?: string,
    image?: BasicImageType,
}

export type SlugType = {
    _type: "slug",
    current: string
}

export type AuthorType = {
    _type: "author",
    _rev: string,
    _updatedAt: string, // TODO: Figure out what this is and assert
    _createdAt: string, // TODO: Figure out what this is and assert
    _id: string,
    title: string,
    slug: {
        _type: "slug",
        current: string
    },
    mainimage: BasicImageType,
    subtitle?: string,
    summary?: string,
    primarySite: UrlType,
    twitterHandle?: string,
}