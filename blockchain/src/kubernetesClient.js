const log = require("./log/logger");

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
class KubernetesClient {
  constructor(k8sApi) {
    this.k8sApi = k8sApi;
  }

  async getService(name, namespace) {
    const response = await this.k8sApi.readNamespacedService(name, namespace);
    return response.body;
  }

  async getServiceIp(name, namespace, retry = 20000) {
    let externalIp = "";
    try {
      log.info(
        `Fetching current service state for service ${name} in ${namespace}`,
      );
      const service = await this.getService(name, namespace);
      if (
        service.status.loadBalancer.ingress !== undefined &&
        service.status.loadBalancer.ingress[0].ip !== undefined
      ) {
        log.info(`Service ${name} is running`);
        log.info(service.status.loadBalancer.ingress);
        externalIp = service.status.loadBalancer.ingress[0].ip;
      } else {
        log.warn(
          `Service ${name} not ready, retry in ${retry / 1000} seconds `,
        );
        await sleep(retry);
        return await this.getServiceIp(name, namespace);
      }
      return externalIp;
    } catch (err) {
      if (err.response && err.body && err.body.code === 403) {
        log.warn(
          "It seems that the service account doesn't have the permissions to view services",
        );
        log.warn("Blockchain will start without an external IP");
      } else {
        log.error(err, `Error while fetching service ip for service "${name}"`);
      }
      return externalIp;
    }
  }
}

module.exports = KubernetesClient;
