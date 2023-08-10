import { Either, Left, Right } from "purify-ts"
import { Result, result } from "../../../lib/result"
import { errorFromUnknown } from "../../../lib/error-handling/error-from-unknown"

type AssetData = {
    id: string, 
    width: number, 
    height: number, 
    format: string
}

export const parseSanityAssetId = (imageReference: string): Either<Error, AssetData> => {
    try {
        const [, id, dimensionString, format] = imageReference.split('-')
            if (!id || !dimensionString || !format) throw new Error(`|> Malformed asset _ref '${imageReference}'. Expected an id like "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg".`)
            
            const [imgWidthStr, imgHeightStr] = dimensionString.split('x')
            const width = +imgWidthStr
            const height = +imgHeightStr

            if (!isFinite(width) || !isFinite(height)) throw new Error(`|> Malformed asset _ref '${imageReference}'. Expected an id like "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg".`)

            return Right({id, width, height, format})
    } catch (err) {
        return Left(errorFromUnknown(err, `Could not parse asset _ref '${imageReference}'`))
    }
}