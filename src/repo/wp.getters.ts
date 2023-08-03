import { wpClient } from "./wp.client";

export const getPosts = async () => wpClient.posts().get().then((posts) => posts).catch((err) => err);