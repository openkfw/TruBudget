# Running TruBudget

## Minimum Requirements

To give your users the best experience, we have tested the deployment of TruBudget on Kubernetes firmly. Therefore  we strongly reccomend to use Kuberntes as we only provide aktive support for Kubernetes deployments. We have some Helm Charts for you in place to get started easily with the deplomyment of TruBudget on Kuberntes.

The minimum requirements aim to provide a working environment with 2 to 5 parallel users and limited data stored. The recommended environment is capable of handling 10 - 50 parallel.

If you plan to deploy TruBudget on a single VM with following services: Blockchain, API and Frontend, we recommend the following for minimum setup:
| | Minimum |
| ------- | ------- |
| CPU† | 2 vCPU |
| RAM | 8 GB |
| Storage | 10 GB |

If you plan to have more than 100 parallel users, we strongly recommend using Kubernetes. TruBudget load and stress tests are run against the minimum and recommend system requirements in a Kubernetes environment to ensure the correctness of the data below.

### Blockchain

|         | Minimum | Recommended |
| ------- | ------- | ----------- |
| CPU†    | 1 vCPU  | 2 vCPU      |
| RAM     | 4 GB    | 8 GB        |
| Storage | 1 GB    | 6 GB      |

:::tip
We highly reccomend to use some sort of volume attached to your blockchain pod to store the data of your Node
:::

### Frontend

|         | Minimum  | Recommended |
| ------- | -------- | ----------- |
| CPU†    | 0.5 vCPU | 1 vCPU      |
| RAM     | 1 GB     | 2 GB        |
| Storage | 1 GB     | 1 GB        |

### API

|         | Minimum  | Recommended |
| ------- | -------- | ----------- |
| CPU†    | 0.5 vCPU | 1 vCPU      |
| RAM     | 2 GB     | 8 GB        |
| Storage | 1 GB     | 1 GB        |

### Export-Service

|         | Minimum  | Recommended |
| ------- | -------- | ----------- |
| CPU†    | 0.5 vCPU | 0.5 vCPU    |
| RAM     | 1 GB     | 1 GB        |
| Storage | 1 GB     | 1 GB        |

### Email-Service

|         | Minimum  | Recommended |
| ------- | -------- | ----------- |
| CPU†    | 0.5 vCPU | 0.5 vCPU    |
| RAM     | 1 GB     | 1 GB        |
| Storage | 1 GB     | 1 GB        |

### Storage-Service

|         | Minimum | Recommended |
| ------- | ------- | ----------- |
| CPU†    | 1 vCPU  | 2 vCPU      |
| RAM     | 1 GB    | 2 GB        |
| Storage | 1 GB    | 50\* GB     |

:::tip
We highly reccomend to use some sort of volume attached to your MinIO pod to store the data of your node
:::

> † Depending on your or your provider's infrastructure, the strength of one virtual CPU might vary. The above values are based on the Intel® Xeon® Platinum 8272CL processor (second generation Intel® Xeon® Scalable processors), Intel® Xeon® 8171M 2.1GHz (Skylake), Intel® Xeon® E5-2673 v4 2.3 GHz (Broadwell), or the Intel® Xeon® E5-2673 v3 2.4 GHz (Haswell) processors.
