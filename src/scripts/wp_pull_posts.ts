import { getPosts } from "./../repo/wp.getters";

export const wpPullPosts = async () => 
    getPosts()
        .then((posts) => 
            console.dir(posts)
        )
        .catch(err => 
            console.log(err)
        )