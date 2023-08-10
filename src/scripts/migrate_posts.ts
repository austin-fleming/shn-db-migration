
import { errorFromUnknown } from "../lib/error-handling/error-from-unknown"
import { EitherAsync, Left, Right } from "purify-ts"
import { existingRepo } from "../existing/repo/existing.repo"
import { destinationRepo } from "../destination/repo/destination.repo"
import { postMapper } from "../destination/repo/post.mapper"
import fs from 'fs'
import path from 'path'
import { sleep } from "../lib/sleep"
import { get } from "http"

const SUCCESS_OUTPUT_PATH = `./src/temporary_data/migration_stats_${new Date().toUTCString()}.json`
const FAILURE_OUTPUT_PATH = `./src/temporary_data/failure_stats_${new Date().toUTCString()}.json`

type OutcomeStats = {
    successes: number,
    failures: number,
    total: number,
    successRate: number
}

type MigrationData = {
    urls: {
        existing: string
        destination: string
    },
    ids: {
        existing: string
        destination: number
    }
}

type FailedMigrationData = {
    errorMessage: string,
    existingId: string,
}

const migratePost = ({
    id, 
    type
}: {
    id: string, 
    type: string
}): EitherAsync<Error, MigrationData> => {
    let existingUrl: string
    let destinationUrl: string
    let existingId: string
    let destinationId: number

    return existingRepo
            .findById({id, type})
            .ifRight((post) => {
                existingUrl = post.seo.originalUrl
                existingId = post.id
            })
            .chain(post => postMapper.postToDto(post))
            .chain(dto => destinationRepo.create(dto))
            .ifRight((post) => {
                destinationUrl = post.link
                destinationId = post.id

                console.log(`| uploaded "${existingId}" as "${destinationId}" to "${destinationUrl}"`)
            })
            .map((): MigrationData => 
                ({
                    urls: {
                        existing: existingUrl,
                        destination: destinationUrl
                    },
                    ids: {
                        existing: existingId,
                        destination: destinationId
                    }
                })
            )
            .mapLeft((err) =>
                errorFromUnknown(err, `Failed to migrate post with id "${id}"`)
            )
    }

const recordMigrationDataToFile = (migrationDataList: MigrationData[]): EitherAsync<Error, string> =>
    EitherAsync(async ({liftEither}) => {
        try {
            const outputPath = path.resolve(SUCCESS_OUTPUT_PATH)
            const data = JSON.stringify(migrationDataList, null, 2)

            fs.writeFileSync(outputPath, data)

            return liftEither(Right(outputPath))
        } catch (err) {
            return liftEither(Left(errorFromUnknown(err, `Failed to record migration data to file`)))
        }
    })

const recordFailedMigrationDataToFile = (failedMigrationDataList: FailedMigrationData[]): EitherAsync<Error, string> =>
    EitherAsync(async ({liftEither}) => {
        try {
            const outputPath = path.resolve(FAILURE_OUTPUT_PATH)
            const data = JSON.stringify(failedMigrationDataList, null, 2)

            fs.writeFileSync(outputPath, data)

            return liftEither(Right(outputPath))
        } catch (err) {
            return liftEither(Left(errorFromUnknown(err, `Failed to record failed migration data to file`)))
        }
    })

const getListSubset = <T>(list: T[], offset: number, count: number): T[] => {
    const start = offset * count
    const end = start + count

    return list.slice(start, end)
}

const migratePosts = (max: number): EitherAsync<Error, OutcomeStats> =>
    EitherAsync(async ({liftEither}) => {
        try {
            let failedMigrationDataList: FailedMigrationData[] = []
            let migrationDataList: MigrationData[] = []
            
            const idList = 
                await existingRepo
                    .listIds(max)
                    .run()
                    .then((outcome) => 
                        outcome
                            .ifLeft(error => {
                                throw error
                            })
                            .unsafeCoerce() 
                    )
            
            
            

            console.log(`Migrating ${idList.length} posts`)
            console.log(`This will take approximately ${idList.length * 2.5 / 60} minutes`)
            console.log(`First id: ${idList[0].id} | last id: ${idList[idList.length - 1].id}`)

            await sleep(2000)

            // The target server will get overloaded if we try to migrate all posts at once
            // So we split the list into subsets and migrate each subset separately
            const ID_SET_LENGTH = 25
            let currentIdSet = 0
            while ((currentIdSet * ID_SET_LENGTH) + ID_SET_LENGTH < idList.length) {
                console.log(`Migrating id set ${currentIdSet + 1} of ${Math.ceil(idList.length / ID_SET_LENGTH)}`)
                const idSublist = getListSubset(idList, currentIdSet, ID_SET_LENGTH)

                await sleep(1000) // Give target server a rest
                for (let i = 0; i < idSublist.length; i++) {
                    const {id, type} = idSublist[i]

                    const migrationData = await migratePost({id, type}).run()

                    migrationData.caseOf({
                        Left: (error) => {
                            failedMigrationDataList.push({
                                errorMessage: error.message,
                                existingId: id
                            })
                        },
                        Right: (data) => {
                            migrationDataList.push(data)
                        }
                    })

                    await sleep(150)
                }

                currentIdSet++
            }

            await recordMigrationDataToFile(migrationDataList)
                .run()
                .then((outcome) =>
                    outcome
                        .ifLeft((error) => {
                            console.error('Failed to record migration data to file')
                            console.error(error)
                        })
                        .ifRight((path) => {
                            console.log(`Migration data recorded to file: ${path}`)
                        })
                )

            await recordFailedMigrationDataToFile(failedMigrationDataList)
                .run()
                .then((outcome) =>
                    outcome
                        .ifLeft((error) => {
                            console.error('Failed to record failed migration data to file')
                            console.error(error)
                        })
                        .ifRight((path) => {
                            console.log(`Failed migration data recorded to file: ${path}`)
                        })
                )

            const outcomeStats: OutcomeStats = {
                successes: migrationDataList.length,
                failures: failedMigrationDataList.length,
                total: migrationDataList.length + failedMigrationDataList.length,
                successRate: migrationDataList.length / (migrationDataList.length + failedMigrationDataList.length)
            }

            return liftEither(Right(outcomeStats))
        } catch (err) {
            return liftEither(Left(errorFromUnknown(err, `Failed to migrate posts`)))
        }
    })

migratePosts(10000)
    .run()
    .then((outcome) => {
        console.log('Migration completed')
        outcome
            .caseOf({
                Left: (error) => {
                    console.error(error)
                },
                Right: (stats) => {
                    console.dir(stats)
                }
            })
    })