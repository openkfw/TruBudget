
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
      console.log(
        `Fetching current service state for service ${name} in ${namespace}`,
      );
      const service = await this.getService(name, namespace);
      if (service.status.loadBalancer.ingress !== undefined && service.status.loadBalancer.ingress[0].ip !== undefined) {
        console.log(`Service ${name} is running`);
        console.log(service.status.loadBalancer.ingress);
        externalIp = service.status.loadBalancer.ingress[0].ip;
      } else {
        console.log(
          `Service ${name} not ready, retry in ${retry / 1000} seconds `,
        );
        await sleep(retry);
        return await this.getServiceIp(name, namespace);
      }
      return externalIp;
    } catch (err) {
      console.log(err.body);
      if (err.response && err.body && err.body.code === 403) {
        console.log(
          "It seems that the service account doesn't have the permissions to view services",
        ); // outputs red underlined text
        console.log("Blockchain will start without an external IP...."); // outputs red underlined text
      } else {
        console.log(`Failed to fetch the external IP of the service.`);
      }
      return externalIp;
    }
  }

}

module.exports = KubernetesClient;
