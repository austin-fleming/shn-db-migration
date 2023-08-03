# Migration Script

A railroad functional approach to migrating from an existing API to a target SQL database. The existing APIs taxonomies are complex and varied. This program outputs them as a single taxonomy suitable for simpler CMS systems. Because there is an intermediate taxonomy the others are simplified into, different origins and targets can be adapted, with a list of failures outputted for manual review.


## Approach

1. Each taxonomy is queried from origin API.
    1. For each piece of content, it is parsed into object with a "happy" or "unhappy" state. If happy, the data satisfies requirements for what is expected for the taxonomy. If unhappy, it carries an informational error describing what went wrong.
    2. This process is repeated for each piece of content in the taxonomy.
2. Successfully parsed queries are then mapped to a general post taxonomy.
    1. Each taxonomy is reduced to a basic "post" type adhering to standard web publishing schemas.
    2. If the process succeeds, it results in a Post entity. If not, an informational error is passed along.
3. Media files are downloaded from the origin to the local machine, saved to particular file path, and the entity is updated with a "file path" variable.
    1. If download is successful, the post follows the happy path.
4. For each post, the media is first uploaded to the target. The ID of the media is then queried. If successful, the post is updated with this new media host link, mapped to the target's schema, and inserted into the DB.
    1. If successful, the post follows the happy path.
5. Two logs are exported:
    1. The "happy log" of posts that successfully migrated.
    2. The "unhappy log" of posts that failed along the way and the reason for why.


## Railroading

This script follows the principles of railroad-oriented programming utilizing a "result" monad. This allows the final output to successfully migrate those files that succeeded while maintaining an error log of failures with precise errors for each failure. This way, single failures don't hinder or become lost in the progress of a large migration.
