import { Either, EitherAsync, Left, Right } from "purify-ts";
import { Result, result } from "../../lib/result";
import { AuthorType, BodyType, FigureType, PostSeoType, SlugType } from "./fragments.dto";
import { repoClient } from "./repo-client";
import { errorFromUnknown } from "../../lib/error-handling/error-from-unknown";
import { VideopostDTO } from "./videopost.dto";

const listIds = (max: number): EitherAsync<Error, {id: string, type: string}[]> =>
    EitherAsync(async ({liftEither}) =>
        repoClient
            .fetch<{id: string, type: string}[]>(`
                *[_type == "videoposts" && !(_id in path("drafts.**"))]
                | order(_createdAt asc) 
                [0...${max}]
                {
                    "id": _id,
                    "type": _type
                }
            `)
            .then((ids) =>
                liftEither(Right(ids))
            )
            .catch(err =>
                liftEither(Left(errorFromUnknown(err, `Failed to fetch videopost ids`)))
            )
    )


const findById = (id: string): EitherAsync<Error, VideopostDTO> =>
    EitherAsync(async ({liftEither}) =>
        repoClient
        .fetch<VideopostDTO>(`
            *[_type == "videoposts" && _id == "${id}"]
            [0]
            {
                ...,
                author->,
                series->
            }    
        `)
        .then((videopost) =>
            liftEither(Right(videopost))
        )
        .catch(err =>
            liftEither(Left(errorFromUnknown(err, `Failed to fetch videopost with id "${id}"`)))
        )
    )

export const videopostRepo = {
    listIds,
    findById
}