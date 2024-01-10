# Research on potential DLT replacements
## Index
- [Introduction](#introduction)
- [Motivation](#motivation)
- [Technologies in Consideration](#technologies-in-consideration)
- [Requirements](#requirements)
- [Blockchain Frameworks](#blockchain-frameworks)
  - [Celo](#celo)
  - [Polygon](#polygon)
  - [Cosmos](#cosmos)
  - [Polkadot and Kusama](#polkadot-and-kusama)
  - [Hyperledger Besu](#hyperledger-besu)
  - [Hyperledger Fabric](#hyperledger-fabric)
- [IPFS and OrbitDB](#ipfs-and-orbitdb)
  - [IPFS](#ipfs)
  - [OrbitDB](#orbitdb)
- [ImmuDB](#immudb)
- [Corda R3](#corda-r3)
## Introduction

TruBudget utilizes Multichain as its core component within its persistence layer. Multichain is not only a blockchain but also a Distributed Ledger Technology (DLT), which brings a different data architecture than from conventional databases. TruBudget leverages the immutability and data verifiability through cryptography provided by DLTs. As DLTs are distributed systems, availability, consistency, and fault tolerance are essential considerations when utilizing such technologies.

## Motivation

During this research, we are taking a look at possible alternatives to Multichain. This is not with the intention of replacing Multichain right away, but more as a reference point to compare similar technologies, their suitability and their advantages/drawbacks.

Currently what drives this motivation is minimal company and community support of the Multichain product. This sets an unclear path in terms of future-proofness.

With this research our goal is to

- Find a product that has more company and community support (Future-proofness)
- Potentially reduce infrastructure complexity, if possible

## Technologies in Consideration
Following is a list of the technologies that are considered to be further investigated during this research:

- Celo
- Polygon
- Cosmos
- Polkadot and Kusama
- Hyperledger Besu
- Hyperledger Fabric
- IPFS and OrbitDB
- ImmuDB
- Corda R3

## Requirements
Following are the requirements to take into consideration either when looking for new technologies (the ones not mentioned above) or when during the investigation of a certain technology.

- **Excellent documentation.**
- **Recognition in the community in terms of scalability and performance.**
- **Active product community and development with clear visions and road-map for the future. It is important that the product is well-established in the community, and does not go under frequent breaking changes.**
- **Possibility to use Javascript/Typescript, as this is the preferred language due to our stack choice.**

> These requirements can be refined and subject to change during future discussions.

## Blockchain Frameworks
### Celo
TBD

### Polygon
TBD

### Cosmos
TBD

### Polkadot and Kusama
TBD

### Hyperledger Besu
TBD

### Hyperledger Fabric
TBD

## IPFS and OrbitDB
### IPFS
IPFS is a distributed file storage protocol that allow nodes to store and serve files in a peer to peer network.

#### Key features
- **IPFS is public by nature.**
- **There are certain developments to make private IPFS networks.**
  - IPFS Cluster
  - IPFS Private swarm keys
- **It uses content addressing, where the key is derived from the content.**
  - A Content ID is generated via cryptographic hashing. This way content is immutable, because any change in content, changes the CID as well. This provides the verification of data integrity.

#### Key Concerns
- **Files have to be pinned to persist in an IPFS Network.**
  - When a file is not pinned by any node, that file will be stored in the cache of the node. Then the file will be deleted during the next run of the IPFS Garbage Collection. Any mistake of not pinning the file, or during, might result in a data loss.
- **Scalability and performance is a concern in IPFS.**
  - P2P networks usually thrive on higher node counts, as the files are distributed in a higher range of nodes, which increases the data availability. Downloading seems to be much slower in smaller networks, although performance metrics concerning private networks seems to be lacking.
- **Lack of consensus.**
  - IPFS is made to be a P2P file sharing/storage technology, thus it does not provide a consensus mechanism, which is crucial for the data consistency in a data sensitive systems.

### OrbitDB
OrbitDB is a distributed P2P database built on IPFS for data storage and Libp2p pub/sub for syncing databases with peers.

#### Key features
- **It is an eventually consistent database.**
  - This means that immediate data consistency is not promised, thus at a given time, two nodes might not have the same data.
- **It offers multiple database type options.**
  - Key-Value
  - Event
  - Document
  - Count
- **Provides an immutable log with traversable history.**
  - When doing data operations immutability is abstracted, meaning that data appears as mutable, however, independent of the database type, OrbitDB holds a log of the every data operation performed in a log, which is called OPLOG.
- **Offers conflict-free database merges.**

#### Key concerns

- **OrbitDb is not considered production ready.**
  - They are still swapping some underlying deprecated library (js-ipfs) with a library called Helia.
  - Next version would include breaking changes. 
  - No planned release date for the new version yet. 
  - Progress can be tracked via merged branches as the project is open-source, but there are no devlogs or progress updates.
- **Poor documentation. Setup for more complicated use-cases is not intuitive.**
  - Documentation is lacking and not sufficient.
  - There is not much (if all) resources online, other than spinning up a very basic network example.
  - Trying to find a solution for a problem might cost a lot of time.
  - Example: Trying to set up a private network is a lot painful than doing so with a plain IPFS network, since js-ipfs (the library OrbitDB uses for now) does not read swarm keys from the file hierarchy. This means that there has to be additional classes and logic written to spin up a swarm network with a private key. What most documentation showed on the internet for js-ipfs however did not work with the OrbitDB.
- **Lacks the data validation and consensus mechanism.**
  - There are no consensus between nodes to make it up for the eventual consistency. Data consistency is a risk.
- **Compatibility and breaking changes.**
 - Upgrade from 1.0 had many breaking changes.
 - Could potentially lead to an unwanted technical debt and refactoring efforts with it in the future.
- **It also includes general concerns of the IPFS, since it is just an additional logical layer implemented on top of the IPFS.**

## ImmuDB

TBD

## Corda R3
TBD