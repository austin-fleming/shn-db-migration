import { EitherAsync, Left, Right } from "purify-ts";
import { PostEntity } from "../../common/types/post.entity";
import { Result, result } from "../../lib/result";
import { quickquoteMapper } from "./quickquote.mapper";
import { quickquoteRepo } from "./quickquote.repo";
import { quickreadMapper } from "./quickread.mapper";
import { quickreadRepo } from "./quickread.repo";
import { videopostMapper } from "./videopost.mapper";
import { videopostRepo } from "./videopost.repo";
import { errorFromUnknown } from "../../lib/error-handling/error-from-unknown";
import { errorFromMessage } from "../../lib/error-handling/error-from-message";

const listIds = (max: number): EitherAsync<Error, {id: string, type: string}[]> =>
    EitherAsync(async ({liftEither}) => {
        try {
            let maxResults = max <= 3 ? 1 : Math.floor(max / 3)

            const idLists = await Promise.all([
                (await quickquoteRepo.listIds(maxResults))
                    .ifLeft(error => {
                        throw error
                    })
                    .unsafeCoerce(),
                (await quickreadRepo.listIds(maxResults))
                    .ifLeft(error => {
                        throw error
                    })
                    .unsafeCoerce(),
                (await videopostRepo.listIds(maxResults))
                    .ifLeft(error => {
                        throw error
                    })
                    .unsafeCoerce() 
            ])

            return liftEither(Right(idLists.flat()))
        } catch (err) {
            return liftEither(Left(errorFromUnknown(err, `listIds: Failed to fetch post ids`)))
        }
    })

const findById = (id: {id: string, type: string}): EitherAsync<Error, PostEntity> =>{
    if (id.type === 'quickquotes') 
        return quickquoteRepo
            .findById(id.id)
            .chain(quickquote => 
                EitherAsync.liftEither(quickquoteMapper.dtoToPost(quickquote))
            )
    
    if (id.type === 'quickreads')
        return quickreadRepo
            .findById(id.id)
            .chain(quickread =>
                EitherAsync.liftEither(quickreadMapper.dtoToPost(quickread))
            )

    if (id.type === 'videoposts') 
        return videopostRepo
            .findById(id.id)
            .chain(videopost => 
                EitherAsync.liftEither(videopostMapper.dtoToPost(videopost))
            )
    
    return EitherAsync.liftEither(Left(errorFromMessage(`Failed to fetch post with id "${id}"`)))
}

export const existingRepo = {
    listIds,
    findById
}
