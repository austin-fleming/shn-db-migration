import { EitherAsync, Left, Right } from "purify-ts";
import { repoClient } from "./repo-client";
import { errorFromUnknown } from "../../lib/error-handling/error-from-unknown";
import { QuickquoteDTO } from "./quickquote.dto";

const listIds = (max: number): EitherAsync<Error, {id: string, type: string}[]> => 
    EitherAsync(async ({liftEither}) => 
            repoClient
                .fetch<{id: string, type: string}[]>(
                    `
                    *[_type == "quickquotes" && !(_id in path("drafts.**"))] 
                    | order(_createdAt asc)[0...${max}] 
                    {
                        "id": _id, 
                        "type": _type
                    }
                    `
                )
                .then((response) => liftEither(Right(response)))
                .catch(err => liftEither(Left(errorFromUnknown(err, `listIds: Failed to fetch quickquote ids`))))
        )

const findById = (id: string): EitherAsync<Error,QuickquoteDTO> => 
    EitherAsync(async ({liftEither}) =>
        repoClient
            .fetch<QuickquoteDTO>(`
                *[_type == "quickquotes" && _id == "${id}"][0]
                {
                    ...,
                    author->
                }
            `)
            .then((quickquote) => liftEither(Right(quickquote)))
            .catch(err => liftEither(Left(errorFromUnknown(err, `findById: Failed to fetch quickquote with id "${id}"`))))
    )

export const quickquoteRepo = {
    listIds,
    findById
}