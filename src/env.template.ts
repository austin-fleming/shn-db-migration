export type EnvironmentTemplate = {
    WP_API: {
        ENDPOINT: string,
        USERNAME: string,
        PASSWORD: string
    },
    SANITY: {
        PROJECT_ID: string,
        DATASET: string,
        TOKEN: string
    }
}