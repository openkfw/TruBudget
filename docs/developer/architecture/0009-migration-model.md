---
sidebar_position: 9
---

# Migration Model

Date: 28/11/2018

## Status

Draft

## Context

This ADR discusses how to handle breaking schema changes of the data-model in the context of a distributed application (TruBudget).

### Explanation of the current implementation
Data is currently stored in streams. A stream contains none, 1, or multiple items. These items can either represent the complete data-set at time of creation or data change (for example an event). In streams that represent the complete data in every item, the last item represents the current state. In streams where items only contain data changes, the items are sourced from the first to the latest in order to get the current state of the data (event-sourcing).

Items which represent complete data-sets are called `Resource`. Items which contain only data changes are called `Event`.

In order to be able to change the interface of `Event` a `Event.dataVersion` field can be defined describing the interface version of the `Event`.

An item of type `Resource` currently doesn't contain a `dataVersion` field. Furthermore it is generally using `HEX` as a dataformat, instead of `JSON` which is used as dataformat for `EVENTS` 

For items of type `Event` the dataVersion is only checked when performing a read requests. When performing a write/publish request to streams containing items from type `Event` no check is performed.

### Subject for change
Before the upcoming release we want to unify the dataformats. More precisly the plan is to get rid of the `HEX` dataformat and only use `JSON`. Hence, we have to introduce a breaking change regarding in our items of type `Resource`. Items created by a node running the new version of Trubudget will be in `JSON` and can't be read by Nodes running an older version of TruBudget (which is expecting `HEX`).

For changing the dataformat in the current case there is no technical solution, how to gracefully migrate. Hence, we will do it on an organisational level (updating all versions simultanously).

But for future updates we want to be better prepared handling version conflicts between different distributed nodes in a TruBudget network.

### Options
In general we need to distinguish on how data is read from the stream.

For streams containing items of type `Event` and doing event-sourcing the newest version needs to be able to read items of older version. If an older version of a node tries to read a stream which contains items of a newer version, it is not able to do so and returns an error.

For streams containing items of type `Resource` only the last element is read. It is pretty much the same: New versions can read stream with items of older versions. But not vice-versa. The only difference is: Since only the last item is read from the stream, old data versions could be migrated resulting in removing source-code which is needed to read the older versions of the item.

Things get more complicated for write operations:

For streams containing items of type `Event` it makes no sense for a node with the old data-version to write, since it might not be able to read it upfront or afterwards.

For streams containing items of type `Resource` it is pretty much the same.

## Decision
Since read and write operation might return errors for nodes running an older dataVersion, these nodes need to be forced to upgrade to a newer version if they still want to participate in the network.

This means:
* Nodes with older dataVersion are not allowed to write to streams
* Nodes with older dataVersion are allowed to read, but might not be able to get the most recent data
* Items of type `Event` or `Resource` extend a DataVersion interface
* The network is aware of all nodes and it's versions (in order to inform them if they run on an old version).

### TODOs


#### Change Hex to JSON format
Every item, which is written to a stream has `JSON` as datatype and should extend the `DataVersion` interface (e.g. `Resource`, `Event`, `Vault`)

Use a DataVersion interface for all three interfaces (Event, Resource, Vault)
````
interface DataVersion {
dataVersion: number
}

interface Resource extends DataVersion {
....
}

````

#### Set new version in network
We create a multichain stream named "versions" where all dataversion should be saved. On startup every node checks its version and updates the stream if it is higher.

streamname : versions
````
{
  keys: ["1"]
  data: {
    json: {
      dataVersion: 1,
      any: [this is a example of the data-format in this version]
    }
  }
}
````

#### Track versions in network
We currently track all nodes that have been registered in the network. For every node an item is saved to the `nodes` stream. We also have to save an item if the node's dataVersion increases to track versions of every node in the network.

streamname: nodes
node-address: "1axuNPTudeCHHBwhJD5tYtRaaGWGpkTon5qd"
````
{
    "keys" : [
            "1axuNPTudeCHHBwhJD5tYtRaaGWGpkTon5qd"
    ],
    "data" : {
        "json" : {
            "key" : "1axuNPTudeCHHBwhJD5tYtRaaGWGpkTon5qd",
            "intent" : "network.registerNode",
            "createdBy" : "<system>",
            "createdAt" : "2018-11-12T09:57:19.104Z",
            "dataVersion" : 1,
            "data" : {
                "address" : "1axuNPTudeCHHBwhJD5tYtRaaGWGpkTon5qd",
                "organization" : "ACMECorp"
            }
        }
    }
}
````


#### Prohibit writing with older version when newer version is set
Before every write operation, the version needs to be checked. The most efficient way to do so is to query the streamkeys with `liststreamkeys` of the `versions` stream.


## Consequences
- an upgraded node might disable all other nodes because nodes with an older version cannot read/write to the multichain in old data-versions
- all items in any stream have a `dataVersion` field
- version needs to be checked before every write operation
