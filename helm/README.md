# Helm Chart TruBudget <!-- omit in TOC -->

- [Prerequisites](#prerequisites)
- [Deploy TruBudget components to your cluster](#deploy-trubudget-components-to-your-cluster)
- [Configuration](#configuration)
- [Deploy Provisioning component to Kubernetes](#deploy-provisioning-component-to-kubernetes)
- [Deploy E2E component to Kubernetes](#deploy-e2e-component-to-kubernetes)

# Deploy TruBudget to Kubernetes with Helm <!-- omit in TOC -->

## Prerequisites

Make sure to have [Helm](https://github.com/helm/helm/blob/master/docs/install.md) installed on the Kubernetes cluster.

```bash
helm init
```

Clone `openkfw/TruBudget` repository and go to `helm` folder.

```bash
git clone https://github.com/openkfw/TruBudget.git
cd TruBudget/helm
```

> _Note_: If you enable PVs make sure the underlying infrastructure is supporting PV provisioning.

## Deploy TruBudget components to your cluster

Navigate to the cluster folder and update dependencies

```bash
cd cluster
helm dep update
```

Deploy components

```bash
helm install . --name trubudget --namespace my-namespace --set tags.minimal=true
```

This will deploy following components:

- Ingress
- Frontend
- API Test
- API Prod
- Blockchain Test
- Blockchain Prod

Delete chart

```bash
helm delete --purge trubudget
```

## Configuration

The following table lists the most important configurable parameters of the TruBudget chart and their default values. For a full list check the [values.yaml](cluster/values.yaml) file.

| Parameter                            | Description                                                                                                                  | Default                                |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `tags.minimal`                       | Includes blockchain-prod-1, blockchain-test1, api-prod-1, api-test1 and frontend-1 components in deployed chart              | `false`                                |
| `tags.blockchain`                    | Includes blockchain-prod-1 and blockchain-test1 components in deployed chart                                                 | `false`                                |
| `tags.api`                           | Includes api-prod-1 and api-test1 components in deployed chart                                                               | `false`                                |
| `tags.frontend`                      | Includes frontend-1 components in deployed chart                                                                             | `false`                                |
| `global.image.tag`                   | `trubudget` image tag                                                                                                        | `master`                               |
| `global.fqdn`                        | ingress host                                                                                                                 | `my-trubudget-url.com`                 |
| `global.fqdn`                        | ingress host                                                                                                                 | `my-trubudget-url.com`                 |
| `global.env.ENVIRONMENT_TYPE=PROD`   | if set to `PROD`, the blockchain resource will be set deployed as `statefulset`and persist its data on a PV                  | `DEV`                                  |
| `global.env.ENVIRONMENT_TYPE=TEST`   | if set to `TEST`, same as `DEV`, except that blockchain service account will be excluded from chart                          | `DEV`                                  |
| `global.env.STORAGE_TYPE=LOCAL`      | if set to `LOCAL`, data is stored in the pod itself                                                                          | `LOCAL`                                |
| `global.env.STORAGE_TYPE=AZURE_DISK` | if set to `AZURE_DISK`, data is stored on a dynamically created azure disk                                                   | `LOCAL`                                |
| `global.env.STORAGE_TYPE=AZURE_FILE` | if set to `AZURE_FILE`, data is stored on a dynamically created azure file                                                   | `LOCAL`                                |
| `global.env.EXPOSE_MC`               | if set to `true`, the blockchain application will check for the external service IP before starting and use it as externalIp | `false`                                |
| `frontend.initContainer`             | use like `frontend-1.initContainer` to enable/disable provisioning container as init containers                              | `false`                                |
| `frontend.ingress.enabled`           | use like `frontend-1.ingress.enabled` to enable/disable ingress                                                              | `false`                                |
| `frontend.ingress.fqdnPrefix`        | use like `frontend-1.ingress.fqdnPrefix` to add a prefix to the `global.fqdn`                                                | `a` for frontend-1, `b` for frontend-2 |

_Tip_: Edit the default [values.yaml](cluster/values.yaml) file that specifies the values for the above parameters, before executing the helm command.

Alternatively, specify each parameter using the `--set key=value[,key=value]` argument to helm install. For example,

```bash
helm install . --name trubudget --namespace my-namespace --set tags.minimal=true --set frontend-1.ingress.enabled=true
```

## Deploy Provisioning component to Kubernetes

To deploy the provisioning components in order to create some initial test data, check out the [provisioning helm chart](./provisioning/README.md).

## Deploy E2E component to Kubernetes

To deploy a isolated environemnt to execute E2E tests, check out the [e2e-test helm chart](./tests/README.md).
