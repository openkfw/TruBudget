# Service Layer

This layer (or directory) offers an interface (as in TypeScript interface, not HTTP interface) to the service TruBudget implements. The domain logic is confined in the domain layer under the [domain directory](./domain/README.md).

Most code in this directory is concerned with MultiChain specifics like JSON-RPC invocations or caching.

## About Migration

_Event-sourcing on a blockchain only supports non-breaking changes to the event format._

First, let's define what a non-breaking change is:

> Non-breaking change: Adding a **new** field that has a sensible **default value**.

This means that removing an existing field, or adding a new field that has no meaningful default value, is considered _breaking_.

In TruBudget, any breaking change requires _migrating_ the data to the new format on a _new chain_.

**Q:** Why not add an event version to the business events?
**A:** If the change is non-breaking, the version is not needed - the fields are checked for existance and substituted by the default value if they're not present. If the change is breaking, the data read from the chain cannot be interpreted as a business event without user intervention, as, by definition, there is no sensible default value for the missing field (btw, it goes without saying that changing a field's _meaning_ is out of the question anyway). Of course, event sourcing doesn't work if user intervention is required, which is why at this point the current chain is effectively _broken_ and must be migrated to a new one.

**Q:** What about having a version per project? Then old projects could use the old event versions and new projects the new versions.
**A:** As the business logic relies on the presence and meaning of an events' fields, the only way to properly support this would be to also have a representation of this mechanism in the domain logic. For example, if a project can be represented in two versions, the domain logic would know a Project-1 entity and a Project-2 entity. Consequently, changes to project-related business logic would have to be done for both of those entities. It's easy to see that this doesn't work in the long run, especially since on a blockchain old versions will _never_ go away.
