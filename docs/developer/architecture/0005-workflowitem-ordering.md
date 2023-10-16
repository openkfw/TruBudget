---
sidebar_position: 5
---
# Workflowitem-ordering

Date: 04/05/2018

## Status

Draft

## Context

Workflowitems are sorted by their creation time by default, but there needs to be some mechanism that allows for manual sorting as well (mainly relevant for the UI). Previously, each workflowitem would hold a pointer to the previous item in the list. However, this approach cannot prevent an inconsistent state if there is a data race between two concurrent requests: it may happen that two workflowitems share the same pointer (turning the list into a tree).

## Decision

We solve this by maintaining the ordering as a list, stored with the subproject the workflowitems belong to:

```plain
subproject stream:
  stream item "workflowitem_ordering" => { data: [id1, id2, ...], log: [], permissions: {}}
```

Note that we use the resource structure here simply to be able to treat the record like any other, but `log` and `permissions` have no meaning at the time of writing.

Since Multichain doesn't offer transactions for stream operations, we cannot guarantee that a newly created workflowitem would always be recorded in the list, so we apply the following trick when computing the ordering:

- Workflowitems that are included in the workflowitem-ordering are included in the result exactly in that ordering;
- all remaining workflowitems are sorted by their creation time and appended to the result.

Because workflowitems are sorted by their creation time by default, newly created items _do not_ have to be added to the ordering, so no inconsistencies can occur.

## Consequences

Using this approach, we get the following properties:

- Without setting an ordering through an API call, the ordering list is empty and all items are sorted by their creation time.
- When an ordering is set, it is respected when returning workflowitems.
- The case of concurrent requests:
  - Concurrent creation causes both items to be appended to the list, ordered by their creation time, or in arbitrary order in case the creation times are equal.
  - Concurrent updates of the ordering is a race with all-or-nothing semantics: whoever finished the update last wins, and there can never be any inconsistencies.
- If an update to the ordering does not include a workflowitem that was not present when the request was issued, when returning the ordered list of workflowitems, the missing workflowitem is simply set as the last element (which makes sense: it is the newest workflowitem, after all).
