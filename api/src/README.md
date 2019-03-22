Dear reader!

Welcome to the **TruBudget API Source Directory**. The source code is organized in _layers_.
There are three of them, each with its own _language_ (related to the idea of Ubiquitous Language in Domain-Driven Design): **application**, **service**, and **domain**. The following diagram describes their relationships and also shows some of their vocabulary:

```plain
+--src-----------------------------------+
|                                        |
|  App                                   |
|  API                                   |
|  HTTP                                  |
|  Route                                 |
|                                        |
|        +--service-------------------+  |
|        |                            |  |
|        |  MultiChain                |  |
|        |  Stream                    |  |
|        |  StreamItem                |  |
|        |  WalletAddress             |  |
|        |  Publisher                 |  |
|        |                            |  |
|        |        +--domain--------+  |  |
|        |        |                |  |  |
|        |        |  Project       |  |  |
|        |        |  Subproject    |  |  |
|        |        |  Workflowitem  |  |  |
|        |        |  Organization  |  |  |
|        |        |  Group         |  |  |
|        |        |  User          |  |  |
|        |        |  Permissions   |  |  |
|        |        |  Notification  |  |  |
|        |        |                |  |  |
|        |        +----------------+  |  |
|        |                            |  |
|        +----------------------------+  |
|                                        |
+----------------------------------------+
```

Note that the inner layer talks about the domain, so it represents a _high level of abstraction_. Conversely, the outer layer talks about the technnical protocol used to invoke the service from other computers on the network, so it represents a _low level of abstraction_.

The concept might sound familiar to you if you've heard of "onion architecture", "ports & adapters" or "hexagonal architecture".

Here are the rules:

- **Don't import or use anything that resides in a parent directory**. An inner layer provides an interface to the outer layer(s). Since the layer is not allowed to refer to anything outside of itself, this interface must be defined in terms of its own language. Consequently, a conversion from one layer's language to another is always done in the layer of lower level of abstraction. This helps to keep the domain layer clear of technical details.
- Never mix levels of abstraction; choose the right layer with that in mind. If you're not sure where to put new code, the words you would use to talk about it might give you a hint. Is it "endpoint", "gRPC" or "GraphQL"? Then you're looking at `src`-level concerns. Is it "caching" or "database"? The service level it is. Are you looking to change who is notified when a certain action happens in a certain way? Sounds business, so it should go into the domain layer. Other things like validation is cross-cutting: the top-level makes sure the request fields are present, while the domain layer validates their values according to business rules (the service layer typically doesn't care about request field validation).
- Within a layer, **group code by feature** into dedicated files.

Some more practical rules:

- A file should either describe an entity or a feature.
- Use `snake_case` for filenames. Although this doesn't seem very idiomatic, with JavaScript it's often not clear how to name files that don't have a default export (it's easy if there's exactly one class in a file, but most of the time that's not the case). By using `snake_case`, it's immediately clear that the filename is different from any functions or classes defined in that file. Additionally, not using upper case letters in filenames improves cross-platform compatibility.
- Write unit tests for the domain layer. Write integration tests for the other layers that test the layer itself plus the layers below. For example, it makes little sense to replace business logic by a mock and test that the database works. Of course, there may be exceptions.
- Put tests into a `.spec.ts` file next to the code under test. For example, code that tests code in `project_update.ts` should go into `project_update.spec.ts`.

# This Directory

This directory defines the **application** context. If you're interested in the general setup, including environment variables and connection setup, take a look at `app.ts`. Most other files are named after the user intent they implement; for example, if a user wants to update a project, the corresponding intent would be `project.update`, with the API implemented in `project_update.ts`. Note that, the intents for creating a project, a subproject and a workflowitem are called `global.createProject`, `project.createSubproject` and `subproject.createWorkflowitem`, respectively.
