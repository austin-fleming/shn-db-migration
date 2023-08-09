# Migration

## Consultant Notes:

For migrating from an existing API to a target SQL database. The existing APIs taxonomies are complex and varied. This program outputs them as a single taxonomy suitable for simpler CMS systems. Because there is an intermediate taxonomy the others are simplified into, different origins and targets can be adapted, with a list of failures outputted for manual review.

### Railroading

This script follows the principles of railroad-oriented programming utilizing a "result" monad. This allows the final output to successfully migrate those files that succeeded while maintaining an error log of failures with precise errors for each failure. This way, single failures don't hinder or become lost in the progress of a large migration.
