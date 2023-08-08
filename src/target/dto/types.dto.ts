type TimestampValue = string;
type Id = number;
type UrlValue = string;
type HtmlString = string;

export type WpPostDTO = {
    id: Id,
    date: TimestampValue,
    date_gmt: TimestampValue,
    guid: {
        rendered: UrlValue,
        raw?: UrlValue
    },
    modified: TimestampValue,
    modified_gmt: TimestampValue,
    slug: string,
    status:
        | "publish"
        | "future"
        | "draft"
        | "pending"
        | "private",
    type: "post" | string, // TODO: update this as types are found
    link: UrlValue,
    title: {
        rendered: string,
        raw?: string,
    },
    content: {
        rendered: HtmlString,
        protected: boolean,
        raw?: string,
        block_version?: number,
    },
    excerpt: {
        rendered?: HtmlString,
        protected: boolean,
    },
    author?: Id,
    featured_media?: Id,
    comment_status:
        | "open"
        | "closed",
    ping_status:
        | "open"
        | "closed",
    sticky: boolean,
    template?: string,
    format:
        | "standard"
        | "aside"
        | "chat"
        | "gallery"
        | "link"
        | "image"
        | "quote"
        | "status"
        | "video"
        | "audio",
    meta?: unknown, // TODO: what type is this?
    categories?: Id[],
    tags?: Id[],
    _links: {
        self: {
            href: UrlValue,
        },
        collection: Array<{
            href: UrlValue,
        }>,
        about: Array<{
            href: UrlValue,
        }>,
        author: Array<{
            embeddable: boolean,
            href: UrlValue,
        }>,
        replies: Array<{
            embeddable: boolean,
            href: UrlValue,
        }>,
        "version-history": Array<{
            count: number,
            href: UrlValue,
        }>,
        "predecessor-version"?: Array<{
            id: Id,
            href: UrlValue,
        }>,
        "wp:attachment": Array<{
            href: UrlValue,
        }>,
        "wp:term": Array<{
            taxonomy: string,
            embeddable: boolean,
            href: UrlValue,
        }>,
        "wp:action-publish": Array<{
            href: UrlValue,
        }>,
        "wp:action-unfiltered-html-form": Array<{
            href: UrlValue,
        }>,
        "wp:action-sticky": Array<{
            href: UrlValue,
        }>,
        "wp:action-assign-author": Array<{
            href: UrlValue,
        }>,
        "wp:action-create-categories": Array<{
            href: UrlValue,
        }>,
        "wp:action-assign-categories": Array<{
            href: UrlValue,
        }>,
        "wp:action-create-tags": Array<{
            href: UrlValue,
        }>,
        "wp:action-assign-tags": Array<{
            href: UrlValue,
        }>,
        curies: Array<{
            name: string,
            href: UrlValue,
            templated: boolean,
        }>,
    }
}

export type WpPostCreateDTO = {
    id?: Id,
    title: string,
    content: string,
    date?: TimestampValue,
    date_gmt?: TimestampValue,
    guid?: string, // TODO: what type is this?
    link?: string,
    modified?: TimestampValue,
    modified_gmt?: TimestampValue,
    slug?: string,
    status?: // NOTE: defaults to "draft"
        | "publish"
        | "future"
        | "draft"
        | "pending"
        | "private",
    type?: string,
    password?: string,
    permalink_template?: string, // TODO: maybe not here
    generated_slug?: string, // TODO: maybe not here
    author?: Id
    excerpt?: string,
    featured_media?: Id,
    comment_status?:
        | "open"
        | "closed",
    ping_status?:
        | "open"
        | "closed",
    format?: 
        | "standard"
        | "aside"
        | "chat"
        | "gallery"
        | "link"
        | "image"
        | "quote"
        | "status"
        | "video"
        | "audio",
    meta?: any, // TODO: what type is this?
    sticky?: boolean,
    template?: string,
    categories?: Id[],
    tags?: Id[],
}

export type WpTagDTO = {
    id: Id,
    count: number,
    description: string,
    link: string,
    name: string,
    slug: string,
    taxonomy: "post_tag" | string, // TODO: update this as types are found
    meta?: unknown, // TODO: what type is this?
    _links: unknown,
}

export type WpTagDeletedDTO = {
    deleted: boolean,
    previous: Omit<WpTagDTO, "_links">,
}

export type WpRestErrorDTO = {
    code?: string,
    message?: string,
    data?: {
        status?: number,
        params?: string[],
        term_id?: number,
    }
}