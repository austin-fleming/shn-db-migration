export const TEMPORARY_MEDIA_PREFIX = "mediaid@"
export const TEMPORARY_MEDIA_SUFFIX = "@"

export const createTemporaryMediaId = (id: string): string => `${TEMPORARY_MEDIA_PREFIX}${id}${TEMPORARY_MEDIA_SUFFIX}`