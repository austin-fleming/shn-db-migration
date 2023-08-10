export const errorFromMessage = (message: string, subMessage?: string): Error => 
    new Error(`|> ${message}${subMessage ? `: ${subMessage}` : ""}`)