import { EitherAsync, Left, Right } from "purify-ts"
import { repoClient } from "./repo_client"
import { WpMediaDTO } from "../dto/types.dto"
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
    title: string, 
    alt: string, 
    caption?: string, 
    description?: string
}): EitherAsync<Error, WpMediaDTO> => 
    EitherAsync(async ({liftEither}) => {
        try {
            const fileResponse = await fetch(url)
            const fileBuffer = Buffer.from(await (await fileResponse.blob()).arrayBuffer())

            const response = await repoClient
                .media()
                // @ts-expect-error: the third party definition is missing the fileBuffer argument
                .file(fileBuffer, fileName)
                .create({
                    title,
                    alt_text: alt,
                    caption,
                    description
                })

            return liftEither(Right(response as WpMediaDTO))
        } catch (err) {
            return liftEither(Left(errorFromUnknown(err, `Failed to upload image "${fileName}"`)))
        }
    })

export const mediaRepo = {
    upload
}