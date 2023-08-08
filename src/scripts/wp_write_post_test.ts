import { type Result, result } from "../lib/result";
import { WpTagDeletedDTO } from "../target/dto/types.dto";
import { postRepo } from "../target/repo/post.repo";
import { tagRepo } from "../target/repo/tag.repo";
import { usecases } from "../target/usecases/usecases";

const wpWriteTagTest = async () => {
    const tags = [
        {
            name: "API Write Test",
            description: "This is a test tag written by the API.",
        },
        {
            name: "API Write Test 2",
            description: "This is a test tag written by the API.",
        }
    ]


    const writtenAndClearedTags = await Promise.all(
        tags
        .map(async (tag): Promise<Result<WpTagDeletedDTO>> => {
            const tagCreateResult = await tagRepo.putTag(tag)

            return tagCreateResult.match({
                ok: async (tag) => tagRepo.deleteTag(tag.id),
                fail: (err) => result.fail(err)
            })
        })
    )

    writtenAndClearedTags.forEach((tagResult) => 
        tagResult.match({
            ok: (tag) => console.log(`Tag "${tag.previous.name}" written and deleted.`),
            fail: (err) => console.log(err)
        })
    )
}

const wpWritePostTest = async () => {
    const testPost = {
        title: "API Write Test",
        /* content: `
        <!-- wp:image {"id":83,"width":960,"height":540,"sizeSlug":"full","linkDestination":"none"} -->
            <figure class="wp-block-image size-full is-resized">
                <img src="https://philliph16.sg-host.com/wp-content/uploads/2023/08/kanhaiya-sharma-_HdRQWJ-Pt8-unsplash.jpg" alt="Here is alt text" class="wp-image-83" width="960" height="540"/>
                
                <figcaption class="wp-element-caption">A caption for this image</figcaption>
            </figure>
        <!-- /wp:image -->
        <!-- wp:quote -->
            <blockquote class="wp-block-quote">
                <!-- wp:paragraph -->
                    <p>quote content</p>
                <!-- /wp:paragraph -->

                <!-- wp:list -->
                    <ul>
                        <!-- wp:list-item -->
                            <li>Item 1</li>
                        <!-- /wp:list-item -->

                        <!-- wp:list-item -->
                            <li>Item 2</li>
                        <!-- /wp:list-item -->
                    </ul>
                <!-- /wp:list -->

                <!-- wp:paragraph -->
                    <p>quote content</p>
                <!-- /wp:paragraph -->
                
                <cite>Some citation</cite>
            </blockquote>
        <!-- /wp:quote -->
        `, */
        content: '<p>Hi All!</p><p>Apologies for the long lists but we hope you find this helpful!</p><p><strong>Your Top Stay-At-Home Reads!</strong></p><p>(You can find these all at our <a href="http://www.amazon.com/shop/smarthernews">Amazon Shop</a>)</p><div style="display:none">Unknown block type "image", specify a component for it in the `components.types` option</div><ul><li>Where The Crawdads Sing</li><li><a href="https://www.amazon.com/dp/1250080401/?ref=exp_smarthernews_dp_vv_d">The Nightingale</a></li><li>The Outlander series</li><li>Little Fires Everywhere</li><li>Sophia Kinsella, Jodi Piccoult, and Lianne Moriatry</li></ul><p>Our latest interview with author Jonathan Horn <a href="https://www.amazon.com/dp/1501154230/?ref=exp_smarthernews_dp_vv_d">on his book “Washington’s End”</a></p><p><strong>Your Top Stay-At-Home Movies!</strong></p><div style="display:none">Unknown block type "image", specify a component for it in the `components.types` option</div><p>Without a doubt – the runaway winner: You’ve Got Mail</p><ul><li>The Princess Bride</li><li>The Wedding Singer</li><li>How to Lose A Guys in 10 Days</li><li>The Notebook</li><li>Forrest Gump</li><li>Sleepless in Seattle</li><li>When Harry Met Sally</li><li>Pride &amp; Prejudice</li><li>Letters from Juliette</li><li>Steel Magnolias</li><li>Top Gun</li><li>Pretty Woman</li><li>Knotting Hill</li><li>Lord of The Rings</li><li>Harry Potter series</li><li>The Holiday</li><li>Lethal Weapon series</li><li>Under The Tuscan Sun</li><li>Fried Green Tomatoes</li><li>Back To The Future</li><li>Dirty Dancing</li><li>Shawshank Redemption</li></ul><p>(Children)</p><div style="display:none">Unknown block type "image", specify a component for it in the `components.types` option</div><ul><li>Toy Story 1-4</li><li>Wreck-It Ralph</li><li>Swiss Family Robinson</li><li>Sound of Music</li><li>Night at the Museum</li><li>Secret Life of Pets</li><li>Lego Movie (hilarious for parents)</li></ul><p><strong>Your Top Stay-At-Home Games</strong> – you can find them in our shop</p><div style="display:none">Unknown block type "image", specify a component for it in the `components.types` option</div><ul><li>Pandemic (The Board Game)</li><li>Settlers of Catan or Catan Junior</li><li>Uno</li><li>Monopoly</li><li>Scrabble</li><li>Busy Toddler Instagram account.</li></ul><p><strong>Your Top Companies to Support Online:</strong></p><p>My personal favorites, all run by incredible American families who believe in American-made: <a href="https://originmaine.com/durable-goods/">Origin Labs</a> (for great protein powder, American-made jeans), <a href="https://www.jlgreenfarm.com/">J&amp;L Green Farm</a> , and <a href="https://www.redlandcotton.com/">Redland Cotton</a>. Also a local shop in the Texas Hill Country if you’re looking for something cute – <a href="https://vintagesoultx.com/">Vintage Soul</a>!</p><p>Some of your recommendations!</p><p><a href="https://madpriestcoffee.com/">Mad Priest Coffee Shop</a>, Chattanooga, TN</p><p><a href="https://themustardseedmarketplace.com/">The Mustard Seed Marketplace</a>, Indiana</p><p><a href="https://wildgroves.com/">Wild Groves Olive Oil</a>, CA</p><p><a href="https://www.misfitsmarket.com/">Misfits Markets</a>, vegetable delivery</p><p><a href="https://studiopillows.com/">Studio Pillows</a>, Austin, Tx</p><p><a href="https://www.youngwildandfriedman.com/">Young Wild Friedman</a> sensory kits for kids!</p><p><a href="https://odinleathergoods.com/">Odin Leather Goods</a>, Tx</p><p><a href="https://www.theshopforward.com/">The Shop Forward</a></p><p><a href="https://www.laurelmercantile.com/">The Laurel Mercantile</a>, Mississippi</p><p><a href="https://freckledhenfarmhouse.com/">The Freckled Hen Farmhouse,</a> Arkansas</p><p><strong>Your Top Stay-At-Home Recipes!</strong></p><div style="display:none">Unknown block type "image", specify a component for it in the `components.types` option</div><p>We received many ideas but your favorite recipe is chicken and dumplings! We received this beauty from Robyn who says its a winner-winner-chicken dinner (see below)!</p><p>We saw you liked tacos, burgers, and treats. So we turned to one of our favorite members of our SmartHER News family – Kelsey at <a href="https://littlebitsof.com/">LittleBitsOf.com</a> – for recommendations and she sent us these:</p><p>Bake her <a href="https://littlebitsof.com/2012/05/rosemary-garlic-bread/">bread</a></p><p>Here’s her <a href="https://littlebitsof.com/2019/04/citrus-garlic-shredded-beef-tacos-instant-pot/">Citrus Garlic Shredded Beef Taco recipe</a></p><p>Awesome healthier <a href="https://littlebitsof.com/2020/02/healthier-samoa-bars/">Samoa Bars</a></p><p><strong>Some of your brilliant recommendations:</strong></p><p>Mary (@maryremmes) loves Martha Stewart’s <a href="https://www.marthastewart.com/1525880/marthas-chocolate-chip-cookies">Chocolate Chip Cookies</a></p><p>Jena (@Jenalcook) who lives in Italy bakes this <a href="https://www.skinnytaste.com/easy-bagel-recipe/">Easy Bagel Recipe</a></p><p>And @buhbake made sure we had something to go with the tacos everyone likes: <a href="http://www.thedefineddish.com/claytons-margarita/">Clayton Margarita</a></p><p><strong>Chicken &amp; Cornmeal Dumplings by Robyn in San Francisco</strong></p><p>*Generous 4-6 Servings</p><p>2 lbs chicken pieces, preferably bone-in, skin on</p><p>6 cups chicken stock</p><p>1 bay leaf</p><p>1 med. celery rib, sliced crosswise* This is optional. Allergic or loathe, leave it.</p><p>3-4 medium carrots, peeled, sliced on diagonal into 1-inch pieces</p><p>4 small white onions, halved lengthwise</p><p>2 large sprigs fresh thyme</p><p>1-2 cups packed coarsely chopped kale leaves</p><p>Salt &amp; pepper to taste</p><p><strong>Cornmeal dumplings:</strong></p><p>1 cup flour</p><p>1/2 cup cornmeal</p><p>2 teaspoons baking powder</p><p>1/2 teaspoon salt</p><p>2 tablespoons cold, unsalted butter, cut into small pieces</p><p>2/3 cup milk</p><p>Prepare stew: In a large Dutch-oven-style pot, combine the chicken pieces, stock, &amp; bay leaf. Bring to boil over high heat. Reduce the heat to moderate, turn the chicken over &amp; cover. Simmer for 10 minutes.<br/>Remove lid &amp; skim fat off broth. Stir in the celery, carrots, onions, &amp; thyme sprigs. Continue to simmer over moderate heat, partially covered, until the carrots &amp; onions are just tender, approx. 15 mins. Season with salt &amp; pepper to taste.</p><p>Prepare the dumplings: in a medium bowl, whisk all dry ingredients. With your fingers or a pastry cutter, gently work butter into flour mixture until it is crumbly. Use a fork to blend in milk.</p><p>Add the kale to the pot. Then drop the batter by tablespoons over the top of the stew. Reduce heat to moderately low, cover, &amp; simmer until dumplings cooked through, about 10 mins. Discard bay leaf &amp; thyme sprigs. Serve stew immediately in shallow soup bowls.</p><p>Final thoughts from Robyn: This recipe can be halved easily. You may also brown the chicken before poaching, if you prefer: Add 2 tsp of olive oil to pan. Bring to medium high heat. Salt &amp; pepper the chicken. Place chicken pieces skin side down. Cook 5 mins per side, then follow from step 1. This recipe is so easy &amp; comforting. I hope it becomes a family favorite. Cheers!</p>',
        tags: ["test 1", "test 2", "test 3"]
    }

    const writtenPost = await usecases.createPost(testPost)

    writtenPost.match({
        ok: (post) =>{ 
            console.dir(post)
            console.log(`Post "${post.title}" written and deleted.`)
        },
        fail: (err) => console.error(err)
    })
}


wpWritePostTest()