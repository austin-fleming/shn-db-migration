import { ENV } from "../../../env";

export const constructImageUrl = (id: string) => 
    `https://cdn.sanity.io/images/${ENV.SANITY.PROJECT_ID}/${ENV.SANITY.DATASET}/${id}`