import { EitherAsync, Left, Right } from "purify-ts"
import { repoClient } from "./repo-client"
import { WpMediaDTO } from "./types.dto"
import { errorFromUnknown } from "../../lib/error-handling/error-from-unknown"

const upload = ({
    url, 
    fileName, 
    title, 
    alt, 
    caption, 
    description
}:{
    url: string, 
    fileName: string, 
    title?: string, 
    alt: string, 
    caption?: string, 
    description?: string
}): EitherAsync<Error, WpMediaDTO> => 
    EitherAsync(async ({liftEither}) => {
        try {
            const fileResponse = 
                await fetch(url)
                    .catch(err => {
                        throw errorFromUnknown(err, 'Failed to fetch image')
                    })

            const fileBlob = 
                await fileResponse
                    .blob()
                    .catch(err => {
                        throw errorFromUnknown(err, 'Failed to create blob')
                    })

            const fileArrayBuffer =
                await fileBlob
                    .arrayBuffer()
                    .catch(err => {
                        throw errorFromUnknown(err, 'Failed to create arrayBuffer')
                    })

            const fileBuffer = Buffer.from(fileArrayBuffer)

            const response = await repoClient
                .media()
                // @ts-expect-error: the third party definition is missing the fileBuffer argument
                .file(fileBuffer, fileName)
                .create({
                    // title: title || fileName,
                    alt_text: alt,
                    // caption,
                    // description
                })

            return liftEither(Right(response as WpMediaDTO))
        } catch (err) {
            return liftEither(Left(errorFromUnknown(err, `Failed to upload image "${fileName}"`)))
        }
    })

export const mediaRepo = {
    upload
}