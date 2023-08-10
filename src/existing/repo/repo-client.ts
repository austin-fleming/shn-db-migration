import {createClient} from '@sanity/client';
import { ENV } from '../../env';

export const repoClient = createClient({
    projectId: ENV.SANITY.PROJECT_ID,
    dataset: ENV.SANITY.DATASET,
    useCdn: true,
    apiVersion: '2023-05-03',
    token: ENV.SANITY.TOKEN,
});