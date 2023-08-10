import { errorFromUnknown } from "../../lib/error-handling/error-from-unknown";
import { WpPostCreateDTO, WpPostDTO } from "./types.dto";
import { repoClient } from "./repo-client";
import { EitherAsync, Left, Right } from "purify-ts";

const create = (post: WpPostCreateDTO): EitherAsync<Error, WpPostDTO> => 
    EitherAsync(async ({liftEither}) => 
        repoClient
            .posts()
            .create(post)
            .then(post =>
                liftEither(Right(post))
            )
            .catch(err =>
                liftEither(Left(errorFromUnknown(err, `Failed to create post with title "${post.title}"`)))
            )
    )

const deleteById = (id: number): EitherAsync<Error, WpPostDTO> =>
    EitherAsync(async ({liftEither}) =>
        repoClient
            .posts()
            .id(id)
            .delete()
            .then(post =>
                liftEither(Right(post))
            )
            .catch(err =>
                liftEither(Left(errorFromUnknown(err, `Failed to delete post with id "${id}"`)))
            )
    )

const updateById = (id: number, post: Partial<WpPostCreateDTO>): EitherAsync<Error, WpPostDTO> =>
    EitherAsync(async ({liftEither}) =>
        repoClient
            .posts()
            .id(id)
            .update(post)
            .then(post =>
                liftEither(Right(post))
            )
            .catch(err =>
                liftEither(Left(errorFromUnknown(err, `Failed to update post with id "${id}"`)))
            )
    )

export const destinationRepo = {
    create,
    deleteById,
    updateById,
}