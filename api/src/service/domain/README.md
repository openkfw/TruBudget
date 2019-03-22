## Overview

This directory contains TruBudget domain/business logic, along with business event and entity definitions.

The domain is split into sub-domains, each located in a dedicated directory (note that `errors` is not a domain on its own). The following graphic shows those domains along with the domain entities they contain:

```plain
+-------+
|       |    +------+
|       |    |Global+--------+  +-----------------------------------+
|       |    +------+        |  |                                   |
|       |                    |  |                                   |
|       |                  +-+--+--+                                |
|       |         +--------+Project+-------------+                  |
|       |         |        +----+--+             |                  |
|       |         |             |                |                  |
|   w   |         |             |                |                  |
|   o   |         |             |                |                  |
|   r   |    +----+-----+       |          +-----+------+    +------+-----+
|   k   |    |Permission+------------------+Workflowitem|    |Notification|
|   f   |    +----+-----+       |          +-----+------+    +------+---+-+
|   l   |         |             |                |                  |   |
|   o   |         |             |                |                  |   |
|   w   |         |             |                |                  |   |
|       |         |             |                |                  |   |
|       |         |             |                |                  |   |
|       |         |             |                |                  |   |
|       |         |        +----+-----+          |                  |   |
|       |         |        |Subproject+----------+                  |   |
|       |         |        +----+-----+                             |   |
|       |         |             |                                   |   |
|       |         |             +-----------------------------------+   |
|       |         |                                                     |
|       |         |                                                     |
|       |         |           +----+                                    |
+-------+         +-----------+User+------------------------------------+
|   o   |                     ++--++
|   r   |                      |  |
|   g   |                      |  |
|   a   |             +--------+  |
|   n   |             |           |
|   i   |          +--+--+        |
|   z   |          |Group+--+     |
|   a   |          +--+--+  |     |
|   t   |             |     |     |
|   i   |             +-----+     |
|   o   |                         |
|   n   |                 +-------+----+
+-------+            +----+Organization+-----+
|       |            |    +------+-----+     |
|   n   |            |           |           |
|   e   |          +-+--+        |        +--+-+
|   t   |          |Vote|        |        |Node|
|   w   |          +-+--+        |        +--+-+
|   o   |            |           |           |
|   r   |            |       +---+---+       |
|   k   |            +-------+Network+-------+
|       |                    +-------+
+-------+
+-------+
|       |
|   s   |
|   y   |                    +------+
|   s   |                    |Backup|
|   t   |                    +------+
|   e   |
|   m   |
|       |
+-------+
```

Code in this layer is not allowed to refer to code in a layer above it. However, within this layer there are no such restrictions. For example, the `NotFound` error type is used in the `organization` context as well as in the `workflow` context; both refer to it directly and the file resides in the shared `errors` directory.

## Commands, Events and Event Sourcing

Aggregates (like project or subproject) are typically implemented in three kinds of files.

### Commands (and Queries)

Files with names that end with a verb, e.g., `project_close.ts`, are invoked by the service layer and implement either a command (= a call that is expected to cause a change event) or a query (= a call that fetches data but typically doesn't cause any changes).

Command files typically contain the following:

- authorization check (= Is the user allowed to do this?)
- precondition checks (= Does the change make sense at this point?), e.g., making sure that all associated subprojects are closed before closing a project.

### Events

Files with names that end with a verb in past tense, e.g., `project_closed.ts`, represent events that have happened. Such events are instantiated by commands.

They typically contain the following:

- A definition of the event's fields.
- Data validation as defined by business rules (with respect to a single entity).
- A means to create a validated instance of the event (usually called `createEvent`).

### Event Sourcing

Finally, files with names that end with `_eventsourcing` (e.g. `project_eventsourcing.ts`) contain the code required to transform a list of events into the corresponding aggregate (that is, a snapshot of the data created by applying the events in order).

It is important that when events are applied, any precondition and authorization checks are performed _again_. This prevents the following attack from happening:

- A user in the TruBudget node has no permissions to do a certain change, but the user has access to the TruBudget host.
- The user uses the MultiChain CLI to add a new event to the chain, which contains the change the user is not authorized for.
- The new event is propagated in the network and thus "sourced" by all other nodes.
- Assuming nodes don't run the authorization check also when sourcing the event, the unauthorized change has become effective and visible in the network.
