import { Result, result } from "../../../lib/result"

export const parseSanityAssetId = (imageReference: string): Result<{id: string, width: number, height: number, format: string}> => 
    result.tryCatch(
        () => {
            const [, id, dimensionString, format] = imageReference.split('-')
            if (!id || !dimensionString || !format) throw new Error(`|> Malformed asset _ref '${imageReference}'. Expected an id like "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg".`)
            
            const [imgWidthStr, imgHeightStr] = dimensionString.split('x')
            const width = +imgWidthStr
            const height = +imgHeightStr

            if (!isFinite(width) || !isFinite(height)) throw new Error(`|> Malformed asset _ref '${imageReference}'. Expected an id like "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg".`)

            return {id, width, height, format}
        },
        (err) => new Error(`|> Could not parse asset _ref '${imageReference}': ${err}`)
    )