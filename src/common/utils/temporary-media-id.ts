import { Either, Left, Right } from "purify-ts"
import { errorFromMessage } from "../../lib/error-handling/error-from-message"

export const TEMPORARY_MEDIA_PREFIX = "@mediaidstart@"
export const TEMPORARY_MEDIA_SUFFIX = "@mediaidend@"

export const createTemporaryMediaId = (id: string, width: number, height: number, format: string): string => `${TEMPORARY_MEDIA_PREFIX}${id}-${width}x${height}.${format}${TEMPORARY_MEDIA_SUFFIX}`

export const findTemporaryMediaIds = (content: string): string[] => {
    const regex = new RegExp(`${TEMPORARY_MEDIA_PREFIX}(.*?)${TEMPORARY_MEDIA_SUFFIX}`, "g")

    return content.match(regex) || []
}

const replaceTemporaryMediaId = (content: string, targetMediaId: string, replacementMediaId: string): string => {
    const regex = new RegExp(`${TEMPORARY_MEDIA_PREFIX}${targetMediaId}${TEMPORARY_MEDIA_SUFFIX}`, "g")

    return content.replace(regex, replacementMediaId)
}

export const extractTemporaryMediaId = (temporaryMediaId: string): Either<Error, string> => {
    const regex = new RegExp(`${TEMPORARY_MEDIA_PREFIX}(.*?)${TEMPORARY_MEDIA_SUFFIX}`, "g")
    const match = regex.exec(temporaryMediaId)

    if (!match) {
        return Left(errorFromMessage(`Failed to extract temporary media id from "${temporaryMediaId}"`))
    }

    return Right(match[1])
}

export const replaceTemporaryMediaIds = (content: string, mediaIdMap: Record<string, string>): string => {
    const temporaryMediaIds = findTemporaryMediaIds(content)

    return temporaryMediaIds.reduce((acc, temporaryMediaId) => {
        const targetMediaId = temporaryMediaId.replace(TEMPORARY_MEDIA_PREFIX, "").replace(TEMPORARY_MEDIA_SUFFIX, "")
        const replacementMediaId = mediaIdMap[targetMediaId]

        return replaceTemporaryMediaId(acc, targetMediaId, replacementMediaId)
    }, content)
}