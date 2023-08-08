import { getAuthors, getPosts } from "../target/wp.getters";

const wpPullPosts = async () => {
    console.log("Pulling posts...")

    await getPosts()
        .then((posts) => 
            console.log(JSON.stringify(posts, null, '\t'))


        )
        .catch(err => 
            console.log(err)
        )

    console.log("...pulling authors...")

    await getAuthors()
        .then((authors) =>
            console.log(JSON.stringify(authors, null, '\t'))
        )
        .catch(err =>
            console.log(err)
        )

    console.log("...done.")
}

wpPullPosts()