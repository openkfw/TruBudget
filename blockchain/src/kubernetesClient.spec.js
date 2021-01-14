const { assert } = require("chai");
const sinon = require("sinon");
let KubernetesClient = require("./kubernetesClient");

let validTest = {
  body: {
    status: {
      loadBalancer: {
        ingress: [{ ip: "123.123.123.123" }]
      }
    }
  }
};

let retryTest = {
  body: {
    status: {
      loadBalancer: {
      }
    }
  }
};

let noServiceTest = {
  response: {},
  body: {
    kind: "Status",
    apiVersion: "v1",
    metadata: {},
    status: "Failure",
    message: "services \"myService\" not found",
    reason: "NotFound",
    details: { name: "myService", kind: "services" },
    code: 404
  }
};

let noRBACServiceTest = {
  response: {},
  body: {
    kind: "Status",
    apiVersion: "v1",
    metadata: {},
    status: "Rejected",
    message: "permission denied",
    reason: "Rejected",
    details: { name: "myService", kind: "services" },
    code: 403
  }
};

describe("KubernetesClient", function() {
  describe("#getServiceIp()", function() {
    it("should return a string in the form of an ip adress, when service exists and has an loadbalancer ip", function(done) {
      let k8sApi = { readNamespacedService: async function () { return Promise.resolve(validTest); } };
      sinon.mock(k8sApi);

      let client = new KubernetesClient(k8sApi);
      client.getServiceIp("myService", "myNamespace")
        .then(response => {
          assert.equal(response, "123.123.123.123");
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });
});

describe("KubernetesClient", function() {
  describe("#getServiceIp()", function() {
    it("should retry to retrieve an ip and return a string in the form of an ip adress, when service exists but assignment of ip is delayed", function(done) {
      let stub = sinon.stub();
      stub.onFirstCall().returns(retryTest);
      stub.onSecondCall().returns(validTest);

      let k8sApi = { readNamespacedService: async function () { return Promise.resolve(stub()); } };
      sinon.mock(k8sApi);

      let client = new KubernetesClient(k8sApi);
      client.getServiceIp("myService", "myNamespace", 10)
        .then(response => {
          assert.equal(response, "123.123.123.123");
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });
});

describe("KubernetesClient", function() {
  describe("#getServiceIp()", function() {
    it("should print a error message and return empty string, when service does not exists", function(done) {
      let k8sApi = { readNamespacedService: async function () { return Promise.reject(noServiceTest); } };
      sinon.mock(k8sApi);

      let client = new KubernetesClient(k8sApi);
      client.getServiceIp("myService", "myNamespace")
        .then(response => {
          assert.equal(response, "");
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });
});

describe("KubernetesClient", function() {
  describe("#getServiceIp()", function() {
    it("should print a error message and return empty string, when api call not allowed", function(done) {
      let k8sApi = { readNamespacedService: async function () { return Promise.reject(noRBACServiceTest); } };
      sinon.mock(k8sApi);

      let client = new KubernetesClient(k8sApi);
      client.getServiceIp("myService", "myNamespace")
        .then(response => {
          assert.equal(response, "");
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });
});
