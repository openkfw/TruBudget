# Helm Chart E2E Tests <!-- omit in TOC -->

- [Prerequisites](#prerequisites)
- [Deploy E2E environment to your cluster](#deploy-e2e-environment-to-your-cluster)
- [Configuration](#configuration)

# Deploy EEP-Portal E2E-Test environment to Kubernetes with Helm <!-- omit in TOC -->

## Prerequisites

Make sure to have [Helm](https://github.com/helm/helm/blob/master/docs/install.md) installed on the Kubernetes cluster.

```bash
helm init
```

Clone `realChainLife/EEP-Portal` repository and go to `helm` folder.

```bash
git clone https://github.com/realChainLife/EEP-Portal.git
cd EEP-Portal/helm
```

## Deploy E2E environment to your cluster

Navigate to the tests folder

```bash
cd tests
helm dep update
```

Deploy components

```bash
helm install . --name eep-portal-e2e --namespace my-namespace
```

This will deploy a pod with two provisioning containers (one for prod, one for test), to create test data.

Start E2E tests

```bash
kubectl exec -n=my-namespace -it e2e-tests --  npm run e2etest -- --config baseUrl=http://frontend/
```

Delete chart

```bash
helm delete --purge eep-portal-e2e
```

## Configuration

The following table lists configurable parameters of the E2E chart and their default values. For a full list check the [values.yaml](values.yaml) file.

| Parameter          | Description                        | Default  |
| ------------------ | ---------------------------------- | -------- |
| `global.image.tag` | `eep-portal/provisioning` image tag | `master` |

_Tip_: Edit the default [values.yaml](values.yaml) file that specifies the values for the above parameters, before executing the helm command.

Alternatively, specify each parameter using the `--set key=value[,key=value]` argument to helm install.
