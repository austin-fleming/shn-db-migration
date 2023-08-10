import { errorFromMessage } from "./error-from-message"

export const errorFromUnknown = (err: unknown, message: string): Error => {
    const childError = err instanceof Error ? err : new Error(JSON.stringify(err))

    return errorFromMessage(message, childError.message)
}