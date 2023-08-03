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
    coverImage: {
        url: string,
        alt?: string,
        caption?: string,
        description?: string,
    }
    body: {
        // TODO: will need to address linking
        content: string,
        images: 
            Array<{
                url: string,
                alt?: string,
                caption?: string,
                description?: string,
            }>
    }
    seo: {
        canonicalUrl: string,
        title?: string,
        description?: string,
        image?: {
            url: string,
            alt?: string,
        },
        aliases: string[],
    },

}