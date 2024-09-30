/* eslint-disable @typescript-eslint/no-explicit-any */
import { assert } from "chai";
import { createStubInstance, stub } from "sinon";

import { SuccessResponse } from "../../httpd/lib";
import { RpcMultichainClient } from "../../service/Client.h";
import * as Liststreamkeyitems from "../../service/liststreamkeyitems";
import { RpcClient } from "../../service/RpcClient";

import { declineNode } from "./declineNode";

const testOrga = "Orga1";
const testAddress = "1234";
const declinerOrga = "OrgaDecliner";
const declinerAddress = "4567";

const request = {
  body: {
    data: {
      node: {
        address: testAddress,
        organization: testOrga,
      },
    },
  },
  user: {
    address: declinerAddress,
    organization: declinerOrga,
  },
};

describe("Decline Node", () => {
  it("Test decline Node successfully", async () => {
    const stubMultichain = createStubInstance(RpcMultichainClient);

    const stubInvoke = stub();
    stubInvoke.withArgs("listpermissions").returns([]);
    const stubInvokePublish = stub();

    stubInvokePublish.returns(
      new Promise((resolve) => {
        resolve(listItemDeclined.data.json);
      }),
    );

    const stubRpcClient: RpcClient = createStubInstance(RpcClient, {
      invoke: stubInvoke,
      invokePublish: stubInvokePublish,
    }) as any as RpcClient;

    stubMultichain.isValidAddress.returns(
      new Promise((resolve) => {
        resolve(true);
      }),
    );
    stubMultichain.v2_readStreamItems.returns(
      new Promise((resolve) => {
        resolve(listItemsResult);
      }),
    );
    stubMultichain.getRpcClient.returns(stubRpcClient);

    const result = await declineNode(stubMultichain, request);
    const status = result[0];
    const resultObject = result[1] as SuccessResponse;
    assert.equal(status, 200);
    assert.equal(resultObject.data.message, `Node ${testAddress} declined`);
  });

  it("Test decline Node with invalid address", async () => {
    const stubMultichain = createStubInstance(RpcMultichainClient);
    stubMultichain.isValidAddress.returns(
      new Promise((resolve) => {
        resolve(false);
      }),
    );
    declineNode(stubMultichain, request)
      .then((response) => {
        assert.isNull(response);
      })
      .catch((err) => {
        assert.isNotNull(err);
        assert.equal(err.address, testAddress);
        assert.equal(err.kind, "AddressIsInvalid");
      });
  });

  it("Test decline Node that was already approved", async () => {
    const stubMultichain = createStubInstance(RpcMultichainClient);

    const stubRpcClient: RpcClient = createStubInstance(RpcClient, {
      invoke: stub().withArgs("listpermissions").returns(listPermissionsResultAlreadyApproved),
    }) as any as RpcClient;

    stubMultichain.isValidAddress.returns(
      new Promise((resolve) => {
        resolve(true);
      }),
    );
    stubMultichain.v2_readStreamItems.returns(
      new Promise((resolve) => {
        resolve(listItemsResult);
      }),
    );
    stubMultichain.getRpcClient.returns(stubRpcClient);

    declineNode(stubMultichain, request)
      .then((response) => {
        assert.isNull(response);
      })
      .catch((err) => {
        assert.isNotNull(err);
        assert.equal(err.message, "Node is already approved");
        assert.equal(err.kind, "PreconditionError");
      });
  });

  it("Test decline Node that was already declined", async () => {
    const stubMultichain = createStubInstance(RpcMultichainClient);

    const stubRpcClient: RpcClient = createStubInstance(RpcClient, {
      invoke: stub().withArgs("listpermissions").returns([]),
    }) as any as RpcClient;

    stubMultichain.isValidAddress.returns(
      new Promise((resolve) => {
        resolve(true);
      }),
    );
    stubMultichain.v2_readStreamItems.returns(
      new Promise((resolve) => {
        resolve([...listItemsResult, listItemDeclined]);
      }),
    );
    stubMultichain.getRpcClient.returns(stubRpcClient);

    declineNode(stubMultichain, request)
      .then((response) => {
        assert.isNull(response);
      })
      .catch((err) => {
        assert.isNotNull(err);
        assert.equal(err.message, `Node is already declined by ${declinerOrga}`);
        assert.equal(err.kind, "PreconditionError");
      });
  });
});

const listItemsResult: Liststreamkeyitems.Item[] = [
  {
    publishers: [declinerAddress],
    keys: [declinerAddress],
    data: {
      json: {
        type: "node_registered",
        source: "system",
        publisher: "system",
        address: declinerAddress,
        organization: declinerOrga,
        time: "2021-02-11T07:53:46.403Z",
      },
    },
    confirmations: 75,
    blocktime: 1613030035,
    txid: "1",
  },
  {
    publishers: [declinerAddress],
    keys: [testAddress],
    data: {
      json: {
        type: "node_registered",
        source: "system",
        publisher: "system",
        address: testAddress,
        organization: testOrga,
        time: "1997-05-09T10:50:23.771Z",
      },
    },
    confirmations: 75,
    blocktime: 1613030035,
    txid: "2",
  },
];

const listItemDeclined = {
  publishers: [declinerAddress],
  keys: [testAddress],
  offchain: false,
  available: true,
  data: {
    json: {
      type: "node_declined",
      source: "system",
      publisher: "system",
      address: testAddress,
      organization: testOrga,
      declinerAddress: declinerAddress,
      declinerOrganization: declinerOrga,
      time: "1997-05-09T10:50:23.771Z",
    },
  },
  confirmations: 4,
  blocktime: 1613477266,
  txid: "3",
};

const listPermissionsResultAlreadyApproved = [
  {
    address: testAddress,
    for: null,
    type: "connect",
    startblock: 0,
    endblock: 4294967295,
    admins: [declinerAddress],
    pending: [],
  },
];
