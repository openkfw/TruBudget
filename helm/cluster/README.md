# Cluster Helm Chart <!-- omit in TOC -->

Deploys all components of TruBudget.

# Table of Contents

- [Table of Contents](#table-of-contents)
- [Good to Know](#good-to-know)
  - [Tags](#tags)
  - [Env: ENVIRONMENT_TYPE](#env-environmenttype)

# Good to Know

## Tags

Following `tags` can be set, to controll the dependencies of the helm chart:

- blockchain - include resources for blockchain
- blockchainSecond - include resources for a second instance of blockchain
- api - include resources for api
- apiSecond - include resources for a second instance of api
- frontend - include resources for frontend
- frontendSecond - include resources for a second instance of frontend
- master - include all of the above

## Env: ENVIRONMENT_TYPE

Can be set to `PROD`, `TEST` or `DEV`

- if not PROD: blockchain resource changed from statefulset to deployment (=without pvc)
- if not PROD: services (api and bc) are type ClusterIP
- if not PROD: service-extern resources are disabled
- if not PROD: uses default sa for blockchain, else creates sa, clusterrole and clusterrolebinding
- if not PROD: use 20 sec delay for probes, else 60 (increased because of waiting for LoadBalancer IP)
