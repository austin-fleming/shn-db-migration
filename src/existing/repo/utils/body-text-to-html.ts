import { PortableTextHtmlComponents, toHTML } from "@portabletext/to-html";
import { isString } from "../../../lib/validators/is-string";
import { parseSanityAssetId } from "./parse-sanity-asset-id";
import { createTemporaryMediaId } from "../../../common/utils/temporary-media-id";
import { Either, Left, Right } from "purify-ts";
import { errorFromUnknown } from "../../../lib/error-handling/error-from-unknown";

export const bodyTextToHtml = (body: Parameters<typeof toHTML>[0], isQuickreadCard?: boolean): Either<Error, string> => {
    try {
        const serializedText = toHTML(body, {
            components: {
                block: {
                    normal: ({children}) => 
                        `<!-- wp:paragraph --><p>${children}</p><!-- /wp:paragraph -->`,
                    // NOTE: there was a legacy hack with h6, but it's not needed anymore
                    h6: ({children}) => 
                        `<!-- wp:paragraph --><p>${children}</p><!-- /wp:paragraph -->`,
                    blockquote: ({children}) => 
                        `<!-- wp:quote --><blockquote class="wp-block-quote">${children}</blockquote><!-- /wp:quote -->`,
                    h1: ({children}) => 
                        `<!-- wp:heading --><h2 class="wp-block-heading">${children}</h2><!-- /wp:heading -->`,
                    h2: ({children}) => 
                        `<!-- wp:heading --><h3 class="wp-block-heading">${children}</h3><!-- /wp:heading -->`,
                    h3: ({children}) => 
                        `<!-- wp:heading --><h4 class="wp-block-heading">${children}</h4><!-- /wp:heading -->`,
                    h4: ({children}) => 
                        `<!-- wp:heading --><h5 class="wp-block-heading">${children}</h5><!-- /wp:heading -->`,
                },
                list: {
                    bullet: ({children}) => 
                        `<!-- wp:list --><ul>${children}</ul><!-- /wp:list -->`,
                    number: ({children}) => 
                        `<!-- wp:list --><ol>${children}</ol><!-- /wp:list -->`,
                    listItem: ({children}) => 
                        `<!-- wp:list-item --><li>${children}</li><!-- /wp:list-item -->`,
                },
                types: {
                    image: ({value}) => 
                        parseSanityAssetId(value.asset._ref)
                            .map(({id, width, height, format}) => {
                                const imageId = createTemporaryMediaId(id, width, height, format)

                                // TODO: should "is-resized" stay?
                                return `
                                <!-- wp:image {"id":"${imageId}","width":${width},"height":${height},"sizeSlug":"full","linkDestination":"none"} -->
                                    <figure class="wp-block-image size-full is-resized">
                                        <img src="${imageId}" alt="${value.alt || ''}" class="wp-image-${imageId}" width="${width}" height="${height}"/>
                                    </figure>
                                <!-- /wp:image -->
                                `
                            })
                            .ifLeft(error => {
                                throw error
                            })
                            .unsafeCoerce() ,
                    youtube: ({value}) => {
                        if (!isString(value.url)) throw new Error(`QuickRead value "body > youtube" was "${value.url}"; expected a string.`)

                        return `<!-- wp:embed {
                            "url":"${value.url}",
                            "type":"video",
                            "providerNameSlug":"youtube",
                            "responsive":true,
                            "className":"wp-embed-aspect-16-9 wp-has-aspect-ratio"
                        } -->
                            <figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio">
                                <div class="wp-block-embed__wrapper">
                                ${value.url}
                                </div>
                            </figure>
                        <!-- /wp:embed -->`
                    },
                    instagramPost: ({value}) => `<!-- wp:paragraph --><p><a href="${value.url} target="_blank" rel="noopener noreferrer"">View Instagram post.</a></p><!-- /wp:paragraph -->`
                },
                marks: {
                    link: ({children, value}) => {
                        if (isQuickreadCard && children.toLowerCase().includes('view sources')) 
                            return ''
                        
                        if (!isString(value?.href))
                            throw new Error(`"body > marks > link" was "${value.href}"; expected a string.`)

                        let enforcedHttpsHref = value.href.startsWith('http://') 
                            ? value.href.replace('http://', 'https://') 
                            : value.href

                        if (value.href.startsWith('https://smarthernews.com') || value.href.startsWith('/')) 
                            return `<a href="${enforcedHttpsHref}">${children}</a>`

                        return `<a href="${enforcedHttpsHref}" target="_blank" rel="noopener noreferrer">${children}</a>`
                    }
                }
            },
            onMissingComponent: (component) => {
                throw new Error(`Missing component "${component}"`)
            }
        })

        return Right(serializedText)
    } catch (err: unknown) {
        return Left(errorFromUnknown(err, `Failed to convert portable text to HTML`))
    }
}