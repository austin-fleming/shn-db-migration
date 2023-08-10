export type PostEntity = {
    id: string,
    title: string,
    slug: string,
    updatedAtTimezone: string,
    updatedAtGMT: string,
    createdAtTimezone: string,
    createdAtGMT: string,
    publishedAtTimezone: string,
    publishedAtGMT: string,
    author?: {
        id: string,
        name: string,
        slug: string,
    }
    tags: string[],
    isPublished: boolean,
    coverImage?: {
        url: string,
        alt: string,
        width: number,
        height: number,
    }
    body: string,
    seo: {
        originalUrl: string,
        description?: string,
        image?: {
            url: string,
            alt: string,
            width: number,
            height: number,
        },
    },
}