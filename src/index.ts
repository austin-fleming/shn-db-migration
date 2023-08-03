import { getQuickQuotes } from "./importers/sanity.getters";
import { getPosts } from "./repo/wp.getters";

// getPosts().then((posts) => console.log(posts)).catch(err => console.log(err))

getQuickQuotes({quantity: 2}).then(console.log).catch(console.error)