import { Result, result } from "../lib/result"
import { Fail, fail } from "../lib/result/fail"
import { quickreadRepo } from "../origin/repo/quickread.repo"
import { repoClient } from "../origin/repo/repo_client"
import fs from "fs"

const OUTPUT_PATH = "./src/temporary_data/sanity_ids.json"
const MAX_POSTS = 1000

type OutcomeStats = {
    successes: number,
    failures: number,
    total: number,
    successRate: number
}

type IdTable = {
    quickquotes: string[]
    cardstacks: string[]
    videos: string[]
}

const fetchPostIds = async (): Promise<Result<IdTable>> => {
    try {
        const quickquoteIds = await repoClient.fetch<string[]>(`*[_type == "quickquotes"]._id | order(_createdAt asc) [0...${MAX_POSTS}]`);
        const cardstackIds = await repoClient.fetch<string[]>(`*[_type == "quickreads"]._id | order(_createdAt asc) [0...${MAX_POSTS}]`);
        const videoIds = await repoClient.fetch<string[]>(`*[_type == "videoposts"]._id | order(_createdAt asc) [0...${MAX_POSTS}]`);

        const idTable = {
            quickquotes: quickquoteIds,
            cardstacks: cardstackIds,
            videos: videoIds
        }

        console.dir(idTable)

        return result.ok(idTable)
    } catch (error) {
        return result.fail(new Error(`|> Failed pulling post ids from origin: ${error}`))
    }
}

const fetchPosts = async (): Promise<Result<OutcomeStats>> => {
    try {
        const quickreadIds = await repoClient.fetch<string[]>(`*[_type == "quickreads" && !(_id in path("drafts.**"))]._id | order(_createdAt asc) [0...${MAX_POSTS}]`);

        let successes = 0
        let failures = 0

        await Promise.all(
            quickreadIds.map(async (id) => {
                const quickread = await quickreadRepo.getQuickreadAsPost(id)
                quickread.match({
                    ok: (post) => {
                        successes++
                    },
                    fail: (error) => {
                        console.error(error)
                        failures++
                    }
                })
            })
        )

        return result.ok({
            successes,
            failures,
            total: successes + failures,
            successRate: successes / (successes + failures)
        })
    } catch (err: unknown) {
        return result.fail(new Error(`|> Failed to fetch quickreads: ${err}`))
    }
}

const writeSanityIds = async (ids: IdTable): Promise<Result<string>> => {
    try {
        await fs.promises.writeFile(OUTPUT_PATH, JSON.stringify(ids, null, '\t'))
        return result.ok(OUTPUT_PATH)
    } catch (error) {
        return result.fail(new Error(`|> Failed writing post ids to ${OUTPUT_PATH}: ${error}`))
    }
}

const sanityPullPostIds = async (): Promise<Result<string>> => {
    try {
        console.log("Pulling post ids from Sanity...")
        const postIds = (await fetchPostIds()).unwrapOrThrow()
        console.log("...done.")

        console.log("Writing post ids to file...")
        const filePath = (await writeSanityIds(postIds)).unwrapOrThrow()
        console.log("...done.")

        return result.ok(filePath)
    } catch (error) {
        return result.fail(new Error(`|> Failed pulling post ids: ${error}`))
    }
}

/* sanityPullPostIds()
    .then((result) => 
        result
            .match({
                ok: (filePath) => console.log(`Successfully pulled post ids to ${filePath}`),
                fail: (error) => console.error(`Failed pulling post ids: ${error}`)
            })
    ) */

fetchPosts().then((response) => {
    response.match({
        ok: (result) => console.log('.'),
        fail: (error) => console.error(error)
    })
})