# Migration

## Consultant Notes:

### Project Background
The client currently has a very large number of publications on an existing, proprietary document-based database in Sanity's data lake service. Due to issues with past publications not being properly validated, the data can be unpredictable. Client needs this old database migrated to bare-bones Wordpress SQL database.

The existing schemas and taxonomies are complicated and the data often doesn't align with the desired schema.

This program digests the older data into a single taxonomy suitable for simpler CMS systems. Because there is an intermediate taxonomy the others are simplified into, different origins and targets can be adapted, with a list of failures outputted for manual review.

### Approach

This script follows the principles of railroad-oriented programming utilizing a "result" monad. This allows the final output to successfully migrate those files that succeeded while maintaining an error log of failures with precise errors for each failure. This way, single failures don't hinder or become lost in the progress of a large migration.

A certain failure rate is to be expected. These items we need specified so they can be manually entered later on.
