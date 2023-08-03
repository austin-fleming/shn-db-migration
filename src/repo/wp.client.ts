const WPAPI = require('wpapi');
import { ENV } from '../env';

export const wpClient = new WPAPI({
    endpoint: ENV.WP_API.ENDPOINT
});