---
sidebar_position: 2
---

# Access Control Model

Date: 03/04/2018

## Status

Accepted

## Context

We need to define our approach to access-control/authorization.

## Decision

Since our users' organizations differ a lot in terms of structures and policies, we
need to have a very versatile access control mechanism in place. In the industry, the
most used technique employed is role-based access control (RBAC). We base our
mandatory access control (MAC) mechanism on RBAC, but use the notion of _intent_
instead of role (an intent can be executed by exactly one role, thus effectively
replacing the role concept).

![Intent + Resource = Permission](./img/0002-access-control-model.png)

### Intents

An intent is what the user is trying to achieve, for example, "add a workflow to a
subproject". By using intents rather than roles, we side-step the problem found in
many projects, where over time developers create similar roles on-the-fly, as from
their point of view the implications of re-using a role are not always clear.
Conversely, intents are always specific to a use case (examples: "create project" or
"list a project's subprojects" rather than "admin" or "user").

While roles _could_ be used to bundle intent-execution rights (e.g. have one role
that is allowed to execute all "view" intents), we think that those roles would have
to be managed by organizations themselves (as it will depend on their structure).
Since in most cases this would mean a 1:1 mapping from role to user group, we skip
roles altogether.

### User Groups

Organizations group their users into _user groups_. For any given projects, each
(resource-specific) intent has a list of user groups assigned to it; all users in the
assigned groups are then allowed to execute the respective intent.

```plain
+-------+               +---------------------+                +---------------+
| User: | is member of  | Group:              | is allowed to  | Intent:       |
| Alice +-------------->+ Project Maintainers +--------------->+ Add workflow  |
|       |               |                     |                | to subproject |
+-------+               +---------------------+                +---------------+
```

### Implementation Pattern

The goal is to enable us to follow a clear pattern for our access control needs:

- HTTP controllers call the domain modules and the authorization module (perhaps using a
  middleware), but do not deal with intents or groups.
- Domain modules may interact with the chain to fetch domain objects, and/or prepare
  closures to be authorized and executed later on. They deal with intents, but not with
  users or groups.
- Finally, the authorization module ensures that the _user_ executing the _intent_
  belongs to a _group_ that is allowed to do that. In order to decide that, the module
  has to fetch resource-specific ACLs from the chain.

Modifying ACLs is done in the same way: each resource's ACL specifies the groups that
may execute the "change this ACL" intent (to be renamed). This hints at the necessity
to provide _defaults_ for ACLs when creating resources.

### Resource-specific Access Control Lists (ACLs)

With each resource/stream on the chain, an ACL stream-item is stored that lists for
each intent the groups allowed to execute that intent:

```json
{
  "acl": {
    "view project": ["all users"],
  },
  ...
}
```

## Consequences

With the proposed changes in place, our users will be able to impose their respective
organizational structures onto TruBudget's resources in a way that should be flexible
enough and straight-forward to integrate with their existing directory servers.
