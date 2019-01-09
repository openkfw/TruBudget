const k8s = require("@kubernetes/client-node");
const os = require("os");
const fs = require("fs");

const kc = new k8s.KubeConfig();

if (fs.existsSync(os.homedir() + "/.kube/config") /* ? */) {
  kc.loadFromDefault();
} else {
  kc.loadFromCluster();
}

const k8sApi = kc.makeApiClient(k8s.Core_v1Api);

async function getService(name, namespace) {
  const response = await k8sApi.readNamespacedService(name, namespace);
  return response.body;
}

async function getServiceIp(name, namespace) {
  let externalIp = "";
  try {
    console.log(
      `Fetching current service state for service ${name} in ${namespace}`,
    );
    const service = await getService(name, namespace);
    if (service.status.loadBalancer.ingress !== undefined) {
      console.log(`Service ${name} is running`);
      console.log(service);
      externalIp = service.status.loadBalancer.ingress[0].ip;
    } else {
      const retry = 20000;
      console.log(
        `Service ${name} not ready, retry in ${retry / 1000} seconds `,
      );
      await sleep(retry);
      await getServiceIp(name, namespace);
      return;
    }
    return externalIp;
  } catch (err) {
    if (err.response && err.body && err.body.code === 403) {
      console.log(
        "It seems that the service account doesn't have the permissions to view services",
      ); // outputs red underlined text
      console.log(err.body);
      console.log("Blockchain will start without an external IP...."); // outputs red underlined text
    } else {
      console.log(`Failed to fetch the external IP of the service ${err.body}`);
    }
    return externalIp;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  getServiceIp,
};
