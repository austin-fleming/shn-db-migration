import { errorFromUnknown } from "../../lib/error-handling/error-from-unknown"
import { isNumber } from "../../lib/validators/is-number"
import { isObject } from "../../lib/validators/is-object"
import { isString } from "../../lib/validators/is-string"
import { WpRestErrorDTO, WpTagDTO, WpTagDeletedDTO } from "./types.dto"
import { repoClient } from "./repo-client"
import { EitherAsync, Left, Right } from "purify-ts"

const findById = (id: number): EitherAsync<Error, WpTagDTO> =>
    EitherAsync(async ({liftEither}) => 
        repoClient
            .tags()
            .id(id)
            .get()
            .then(tag => 
                liftEither(Right(tag))
            )
            .catch(err =>
                liftEither(Left(errorFromUnknown(err, `Failed to get tag "${id}"`))
            )
    ))

const createByName = (name: string): EitherAsync<Error, WpTagDTO> =>
    EitherAsync(async ({liftEither}) => 
        repoClient
            .tags()
            .create({name})
            .then(tag =>
                liftEither(Right(tag))
            )
            .catch(err => {
                if (isObject(err) && err?.code === "term_exists") {
                    return liftEither(Left(errorFromUnknown(err, `Tag "${name}" already exists`)))
                }

                return liftEither(Left(errorFromUnknown(err, `Failed to create tag "${name}"`)))
            })
    )


const putByName = (name: string): EitherAsync<Error, WpTagDTO> =>
    EitherAsync(async ({liftEither}) => {
        try {
            const createdTag = await repoClient
                .tags()
                .create({name})

            return liftEither(Right(createdTag))
        } catch (err) {
            // NOTE: if the error isn't a "term_exists" error with accompanying "term_id" that can be parsed, fail
            // These checks might look neurotic, but this isn't the place to be throwing cryptic errors
            if (!isObject(err) || err?.code !== "term_exists") {
                return liftEither(Left(errorFromUnknown(err, `Failed to write or find existing tag "${name}"`)))
            }

            if ( !isObject(err?.data) || !(isNumber(err?.data?.term_id) || isString(err?.data?.term_id)) ) {
                return liftEither(Left(errorFromUnknown(err, `Existing tag "${name}" was found, but no usable ID was provided in error`)))
            }

            const existingTagId = isNumber(err.data.term_id) 
                ? err.data.term_id 
                : parseInt(err.data.term_id, 10)

            return repoClient
                .tags()
                .id(existingTagId)
                .get()
                .then((tagResponse: WpTagDTO) => 
                    liftEither(Right(tagResponse))
                )
                .catch((err: WpRestErrorDTO) => 
                    liftEither(Left(errorFromUnknown(err, `Could not create or find the tag "${name}". Expected to find existing tag with id "${existingTagId}", but no results returned`)))
                )
        }
    })

const putListByName = (tags: string[]): EitherAsync<Error, WpTagDTO[]> => 
    EitherAsync.sequence(tags.map(tag => putByName(tag)))

const deleteById = (id: number): EitherAsync<Error, WpTagDeletedDTO> =>
    EitherAsync(async ({liftEither}) => 
        repoClient
            .tags()
            .id(id)
            .delete({
                force: true // NOTE: force is required to delete tags
            })
            .then((tag: WpTagDeletedDTO) => 
                liftEither(Right(tag))
            )
            .catch(err =>
                liftEither(Left(errorFromUnknown(err, `Failed to delete tag "${id}"`)))
            )
    )

export const tagRepo ={
    findById,
    createByName,
    putByName,
    putListByName,
    deleteById
}