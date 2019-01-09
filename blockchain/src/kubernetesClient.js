const k8s = require('@kubernetes/client-node');
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
  try {
    console.log(`Fetching current service state for service ${name} in ${namespace}`);
    const service = await getService(name, namespace);
    let externalIp = "";
    if (service.status.loadBalancer.ingress !== undefined) {
      console.log(`Service ${name} is running`);
      externalIp = service.status.loadBalancer.ingress[0].ip;
    } else {
      const retry = 15000;
      console.log(`Service ${name} not ready, retry in ${retry / 1000} seconds `);
      await sleep(retry);
      await getServiceIp(name, namespace);
      return;
    }
    return externalIp;
  } catch (err) {
    let errorMsg = err.body.message;
    console.log(`Couldn't find service ${name} in the namespace ${namespace}. Error: ${errorMsg}`);
  }
}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  getServiceIp
};
