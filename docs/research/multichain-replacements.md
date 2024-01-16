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
Cosmos SDK is specifically designed for the Cosmos ecosystem 

The limitations of using Cosmos SDK to create a private blockchain network are not explicitly mentioned in the provided search results. However, it's important to note that Cosmos SDK is designed to facilitate the development of interconnected blockchains within the Cosmos ecosystem, and it provides a modular framework for building custom blockchains with interoperability features[2][3]. One potential limitation could be the level of isolation for a private blockchain built using Cosmos SDK, as the framework is primarily focused on enabling communication and interoperability between blockchains within the Cosmos network[1]. Developers intending to create fully isolated private blockchains may need to carefully consider the extent to which Cosmos SDK can support such a use case. Additionally, the scalability of private blockchains built with Cosmos SDK may be a consideration, as the framework is optimized for creating interconnected blockchains that can communicate with each other[5]. While the SDK offers benefits such as interoperability and modular development, developers should assess whether these features align with the specific requirements of their private blockchain network.


### Polkadot and Kusama

Polkadot is an open-source sharded multichain protocol with a focus on enabling cross-blockchain transfers of any type of data or asset, thereby allowing blockchains to be interoperable with each other. Polkadot describes a format for a network of blockchains, thus making it a layer-0 metaprotocol.

Polkadot protocol connects the public and private chains (these are called Parachains) through its Relay Chain.  Relay Chain is the central chain in the Polkadot network for coordinating the whole ecosystem of parachains. 

Kusama on the other hand is used as sort of a standalone canary network for the Polkadot for the experimentation and early-stage deployment purposes. However Polkadot can process more transactions per second, and is more suitable as a enterprise-level deployments.

Both Polkadot and Kusama use Substrate SDK as primary blockchain SDK to create parachains. All chains created using Substrate SDK are seamlessly compatible with Polkadot and Kusama. For these reasons, we will mostly focus on Substrate SDK.

A short overview of Polkadot Architecture:

![Polkadot Architecture](Polkadot_Arch.png)

#### Substrate SDK

Substrate is a powerful blockchain development framework that allows developers to create blockchain solutions, including private blockchain networks.

#### Key features
- **A range of pre-built modules and libraries**
  - These modules and libraries simplify and quicken the development process.
- **Allows customized blockchains and private networks**
- **Private chains are compatible to deploy on public Kusama and Polkadot networks.**
- **Active developer community and regular updates**

#### Key concerns
- **The offered pre-built modules and libraries might not provide exact level of customization needed for specific use cases or industry level requirements.**
  - This can either result in changing Substrate codebase or development of custom modules, which in both ways increase development time and effort.
- **Designed for scalability, but might fall short in comparison to other blockchain frameworks, which offer higher transactions per seconds and a native private network support.**
- **Offered security might end up not being sufficient for specific use cases.**
- **Uses Rust as the framework language**
  - Rust as a language is challenging to learn due it's ownership model in memory management.
  - This can make onboarding and finding other developers harder.

We do not recommend Polkadot/Kusama as a replacement due to Substrate SDK being Rust based. There are other similar blockchain frameworks, which offer multiple programming languages to choose from. Being locked into Rust as a language, would only make future onboarding of developers harder, as well as finding suitable replacements.

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