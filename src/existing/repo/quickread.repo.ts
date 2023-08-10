import { EitherAsync, Left, Right } from "purify-ts";
import { repoClient } from "./repo-client";
import { errorFromUnknown } from "../../lib/error-handling/error-from-unknown";
import { QuickreadDTO } from "./quickread.dto";



const listIds = (max: number): EitherAsync<Error, {id: string, type: string}[]> => 
    EitherAsync(async ({liftEither}) =>
        repoClient
            .fetch<{id: string, type: string}[]>(`
                *[_type == "quickreads" && !(_id in path("drafts.**"))]
                | order(_createdAt asc) 
                [0...${max}] 
                {
                    "id": _id,
                    "type": _type
                }
            `)
            .then(ids => 
                liftEither(Right(ids))
            )
            .catch(err => 
                liftEither(Left(errorFromUnknown(err, `Failed to fetch quickread ids`)))
            )
    )

const findById = (id: string): EitherAsync<Error, QuickreadDTO> => 
    EitherAsync(async ({liftEither}) =>
        repoClient
            .fetch<QuickreadDTO>(`
                *[_type == "quickreads" && _id == "${id}"]
                [0]
                {
                    ...,
                    author->,
                    series->
                }
            `)
            .then((quickread) =>
                liftEither(Right(quickread))
            )
            .catch(err =>
                liftEither(Left(errorFromUnknown(err, `Failed to fetch quickread with id "${id}"`)))
            )
    )

export const quickreadRepo = {
    listIds,
    findById
}