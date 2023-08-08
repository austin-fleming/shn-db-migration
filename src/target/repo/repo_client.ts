import WPAPI from 'wpapi';
import { ENV } from '../../env';

export const repoClient = new WPAPI({
    endpoint: ENV.WP_API.ENDPOINT,
    username: ENV.WP_API.USERNAME,
    password: ENV.WP_API.PASSWORD
});