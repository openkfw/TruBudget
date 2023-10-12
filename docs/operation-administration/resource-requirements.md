# Running TruBudget

## Resource Requirements

To ensure the best possible experience for your users, we've conducted extensive testing of TruBudget deployments with various configurations. Our top recommendation is to utilize a Kubernetes-based infrastructure, which not only offers exceptional flexibility but also ensures scalability and security for TruBudget deployments. This setup has undergone rigorous testing and has proven to be highly successful in running TruBudget deployments. It's the only infrastructure we can confidently guarantee will deliver a seamless experience.

To simplify the deployment process, we've provided a [Helm chart template](https://github.com/openkfw/TruBudget/tree/main/helm) that you can use as a starting point for deploying TruBudget on Kubernetes. While our Helm charts provide a solid foundation, please be aware that additional configuration steps may be required. For more comprehensive guidance, please refer to our Helm documentation.

The resource allocation for your TruBudget instance can be tailored to your specific usage needs. Different components require varying levels of resources, with the API and blockchain typically demanding the most in terms of CPU, memory, and storage capacity. It's worth noting that the resource requirements may fluctuate, especially concerning blockchain data volume. In such cases, it may be necessary to implement scaling mechanisms (refer to the scaling section below) to accommodate these changes effectively.

Here are some example configurations to consider. Please keep in mind that the minimal requirements are suitable for TruBudget instances with low parallel user activity and minimal data flow. On the other hand, the recommended usage guidelines are intended for instances that handle more than 10 concurrent users and involve frequent and substantial data exchanges.
If you anticipate heavy usage of TruBudget, it's important to be aware that the recommended configuration may not provide sufficient resources.

### VMs
If you plan to deploy TruBudget on a single VM with following services: Blockchain, API and Frontend, we recommend the following for minimum setup:
| | Minimum |
| ------- | ------- |
| CPU† | 2 vCPU |
| RAM | 8 GB |
| Storage | 10 GB |


### Kubernetes
If you chose the recommended approach using Kubernetes please check the requirements below. TruBudget load and stress tests are run against the minimum and recommend system requirements in a Kubernetes environment to ensure the correctness of the data below. However, depending on your use-case, the recommended approach might need to be adjusted accordingly. We recommend also having a monitoring tool in place to be able to monitor the resource usage and be able to adjust accordingly, check out [monitoring & logging guide](https://trubudget.net/docs/operation-administration/logging-monitoring) for more information.

### Blockchain

|         | Minimum | Recommended |
| ------- | ------- | ----------- |
| CPU†    | 1 vCPU  | 2 vCPU      |
| RAM     | 4 GB    | 8 GB        |
| Storage | 1 GB    | 6 GB        |


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

### Email-Service & Email-DB

|         | Minimum  | Recommended |
| ------- | -------- | ----------- |
| CPU†    | 0.5 vCPU | 0.5 vCPU    |
| RAM     | 1 GB     | 1 GB        |
| Storage | 1 GB     | 1 GB        |

### Storage-Service & MinIO

|         | Minimum | Recommended |
| ------- | ------- | ----------- |
| CPU†    | 1 vCPU  | 2 vCPU      |
| RAM     | 1 GB    | 2 GB        |
| Storage | 1 GB    | 50\* GB     |

:::tip
Depending on the volume of data you intend to store within your components, it's advisable to consider attaching a volume where necessary. This is particularly crucial for components such as Blockchain, MinIO, and Email-DB, as they may handle substantial data loads that require safe and persistent storage. It's worth noting that the Storage-service, in particular, has higher storage demands compared to other components, as it is storing documents.
:::

> † Depending on your or your provider's infrastructure, the strength of one virtual CPU might vary. The above values are based on the Intel® Xeon® Platinum 8272CL processor (second generation Intel® Xeon® Scalable processors), Intel® Xeon® 8171M 2.1GHz (Skylake), Intel® Xeon® E5-2673 v4 2.3 GHz (Broadwell), or the Intel® Xeon® E5-2673 v3 2.4 GHz (Haswell) processors.

## Scaling TruBudget

Depending on your infrastructure as well as on the specific use-case, you might have to scale TruBudget.

## Scaling Vertically
This is the approach we used in our current TruBudget instances and tests. Individual components can be scaled up or down by adjusting the resources depending on the necessity.

## Scaling Horizontally
Scaling TruBudget horizontally is as easy as adding new instances of the services to your deployment. This is possible on all TruBudget services except the blockchain. Due to the specific architecture of TruBudget, enabling an additional blockchain node would not lead to the desired results but rather add a new node to the blockchain network. The other components (e.g. the API) can be scaled out, however we do not offer a guide for this so you would need to enable the specific infrastructure mechanisms independently. 

