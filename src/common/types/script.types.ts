export type OutcomeStats = {
    successes: number,
    failures: number,
    total: number,
    successRate: number
}

export type MigrationData = {
    urls: {
        existing: string
        destination: string
    },
    ids: {
        existing: string
        destination: number
    }
}

export type FailedMigrationData = {
    errorMessage: string,
    existingId: string,
}