# Helm Chart Provisioning <!-- omit in TOC -->

- [Prerequisites](#prerequisites)
- [Deploy Provisioning components to your cluster](#deploy-provisioning-components-to-your-cluster)
- [Configuration](#configuration)

# Deploy TruBudget Provisioning to Kubernetes with Helm <!-- omit in TOC -->

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

## Deploy Provisioning components to your cluster

Navigate to the provisioning folder

```bash
cd provisioning
```

Deploy components

```bash
helm install . --name trubudget-provisioning --namespace my-namespace
```

This will deploy a pod with two provisioning containers (one for prod, one for test), to create test data.

Check logs

```bash
kubectl logs provisioning -c provision-prod
kubectl logs provisioning -c provision-test
```

Delete chart

```bash
helm delete --purge trubudget-provisioning
```

## Configuration

The following table lists configurable parameters of the Provisioning chart and their default values. For a full list check the [values.yaml](values.yaml) file.

| Parameter                      | Description                                                       | Default           |
| ------------------------------ | ----------------------------------------------------------------- | ----------------- |
| `global.image.tag`             | `trubudget/provisioning` image tag                                | `master`          |
| `provisioning.prod.isRequired` | enable/disable container responsible to create data for api-prod  | `true`            |
| `provisioning.test.isRequired` | enable/disable container responsible to create data for api-test  | `true`            |
| `provisioning.prod/test.env`   | contains environment variables to connect to api, e.g. `API_HOST` | check values.yaml |

_Tip_: Edit the default [values.yaml](values.yaml) file that specifies the values for the above parameters, before executing the helm command.

Alternatively, specify each parameter using the `--set key=value[,key=value]` argument to helm install.
