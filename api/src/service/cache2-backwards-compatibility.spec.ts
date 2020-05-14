import { assert } from "chai";

import * as Result from "../result";
import { parseBusinessEvents } from "./cache2";

interface Testcase {
  stream: string;
  streamItems: any[];
  addUnknownProperty: (items: any[]) => void;
  makeItemsInvalid: (items: any[]) => void;
}

// Prepare testcases for all different streamitems
const testcases: Testcase[] = [];

// Project stream item testcase preperation
const projectStreamItems: any[] = [
  {
    publishers: [],
    keys: [],
    data: {
      json: {
        type: "project_created",
        source: "http",
        publisher: "root",
        project: {
          id: "90ffe1958bc5734abc70a2464437fe92",
          status: "open",
          displayName: "foo",
          description: "",
          assignee: "root",
          thumbnail: "",
          projectedBudgets: [],
          permissions: {},
          additionalData: {},
        },
        time: "2019-07-25T12:03:25.315Z",
      },
    },
    confirmations: 0,
    blocktime: 1,
    txid: "1",
  },
];
const addUnknownPropertyToProject = items => {
  items.forEach(item => {
    item.data.json.project.additionalUnknownProperty = true;
  });
};
const makeProjectItemsInvalid = items => {
  items.forEach(item => {
    delete item.data.json.project.id;
  });
};

const projectTestcase: Testcase = {
  stream: "project",
  streamItems: projectStreamItems,
  addUnknownProperty: addUnknownPropertyToProject,
  makeItemsInvalid: makeProjectItemsInvalid,
};

// Subproject stream item testcase preperation
const subprojectStreamItems: any[] = [
  {
    publishers: [],
    keys: [],
    data: {
      json: {
        type: "subproject_created",
        source: "http",
        publisher: "root",
        projectId: "projectId",
        subproject: {
          id: "subprojectId",
          status: "open",
          displayName: "foo",
          description: "",
          assignee: "root",
          currency: "EUR",
          projectedBudgets: [],
          permissions: {},
          additionalData: {},
        },
        time: "2019-07-25T12:03:25.315Z",
      },
    },
    confirmations: 0,
    blocktime: 1,
    txid: "1",
  },
];
const addUnknownPropertyToSubproject = items => {
  items.forEach(item => {
    item.data.json.subproject.additionalUnknownProperty = true;
  });
};
const makeSubprojectItemsInvalid = items => {
  items.forEach(item => {
    delete item.data.json.subproject.id;
  });
};

const subprojectTestcase: Testcase = {
  stream: "subproject",
  streamItems: subprojectStreamItems,
  addUnknownProperty: addUnknownPropertyToSubproject,
  makeItemsInvalid: makeSubprojectItemsInvalid,
};

// Workflowitem stream item testcase preperation
const workflowitemStreamItems: any[] = [
  {
    publishers: [],
    keys: [],
    data: {
      json: {
        type: "workflowitem_created",
        source: "http",
        publisher: "root",
        projectId: "projectId",
        subprojectId: "subprojectId",
        workflowitem: {
          id: "workflowitemId",
          status: "open",
          displayName: "foo",
          description: "",
          assignee: "root",
          amountType: "N/A",
          documents: [],
          permissions: {},
          additionalData: {},
        },
        time: "2019-07-25T12:03:25.315Z",
      },
    },
    confirmations: 0,
    blocktime: 1,
    txid: "1",
  },
  {
    publishers: [],
    keys: [],
    data: {
      json: {
        type: "workflowitem_created",
        source: "http",
        publisher: "root",
        projectId: "projectId",
        subprojectId: "subprojectId",
        workflowitem: {
          id: "workflowitemId",
          status: "open",
          displayName: "foo",
          description: "",
          assignee: "root",
          amountType: "N/A",
          documents: [],
          permissions: {},
          additionalData: {},
          workflowitemType: "general",
        },
        time: "2019-07-25T12:03:25.315Z",
      },
    },
    confirmations: 0,
    blocktime: 1,
    txid: "1",
  },
];
const addUnknownPropertyToWorkflowitem = items => {
  items.forEach(item => {
    item.data.json.workflowitem.additionalUnknownProperty = true;
  });
};
const makeWorkflowitemItemsInvalid = items => {
  items.forEach(item => {
    delete item.data.json.workflowitem.id;
  });
};

const workflowitemTestcase: Testcase = {
  stream: "workflowitem",
  streamItems: workflowitemStreamItems,
  addUnknownProperty: addUnknownPropertyToWorkflowitem,
  makeItemsInvalid: makeWorkflowitemItemsInvalid,
};

// User stream item testcase preperation
const userStreamItems: any[] = [
  {
    publishers: [],
    keys: [],
    offchain: false,
    available: true,
    data: {
      json: {
        type: "user_created",
        source: "http",
        publisher: "root",
        user: {
          id: "userId",
          displayName: "testuser",
          organization: "testorga",
          passwordHash: "$2a$08$eABl",
          address: "$2a$08$eABl",
          encryptedPrivKey: "$2a$08$eABl",
          permissions: {},
          additionalData: {},
        },
        time: "2019-07-25T12:03:25.315Z",
      },
    },
    confirmations: 0,
    txid: "1",
  },
];
const addUnknownPropertyToUser = items => {
  items.forEach(item => {
    item.data.json.user.additionalUnknownProperty = true;
  });
};
const makeUserItemsInvalid = items => {
  items.forEach(item => {
    delete item.data.json.user.id;
  });
};

const userTestcase: Testcase = {
  stream: "users",
  streamItems: userStreamItems,
  addUnknownProperty: addUnknownPropertyToUser,
  makeItemsInvalid: makeUserItemsInvalid,
};

// Group stream item testcase preperation
const groupStreamItems: any[] = [
  {
    publishers: [],
    keys: [],
    offchain: false,
    available: true,
    data: {
      json: {
        type: "group_created",
        source: "http",
        publisher: "root",
        group: {
          id: "groupId",
          displayName: "testgroup",
          description: "",
          members: ["testuser"],
          permissions: {},
          additionalData: {},
        },
        time: "2019-07-25T12:03:25.315Z",
      },
    },
    confirmations: 0,
    blocktime: 1,
    txid: "1",
  },
];
const addUnknownPropertyToGroup = items => {
  items.forEach(item => {
    item.data.json.group.additionalUnknownProperty = true;
  });
};
const makeGroupItemsInvalid = items => {
  items.forEach(item => {
    delete item.data.json.group.id;
  });
};

const groupTestcase: Testcase = {
  stream: "groups",
  streamItems: groupStreamItems,
  addUnknownProperty: addUnknownPropertyToGroup,
  makeItemsInvalid: makeGroupItemsInvalid,
};

// Notification stream item testcase preperation
const notificationStreamItems: any[] = [
  {
    publishers: [],
    keys: [],
    offchain: false,
    available: true,
    data: {
      json: {
        type: "notification_created",
        source: "http",
        time: "2019-07-25T12:03:25.315Z",
        publisher: "root",
        notificationId: "2cfd0663-1770-4184-974e-63129061d389",
        recipient: "test",
        businessEvent: {
          type: "project_updated",
          source: "http",
          publisher: "root",
          time: "2019-07-29T16:22:02.026Z",
          projectId: "projectId",
          update: {
            description: "test",
          },
        },
      },
    },
    confirmations: 0,
    blocktime: 1,
    txid: "1",
  },
];
const addUnknownPropertyToNotification = items => {
  items.forEach(item => {
    item.data.json.additionalUnknownProperty = true;
  });
};
const makeNotificationItemsInvalid = items => {
  items.forEach(item => {
    delete item.data.json.notificationId;
  });
};

const notificationTestcase: Testcase = {
  stream: "notifications",
  streamItems: notificationStreamItems,
  addUnknownProperty: addUnknownPropertyToNotification,
  makeItemsInvalid: makeNotificationItemsInvalid,
};

// Global permissions stream item testcase preperation
const globalPermissionStreamItems: any[] = [
  {
    data: {
      json: {
        type: "global_permission_granted",
        source: "http",
        time: "2019-07-25T12:03:25.315Z",
        publisher: "root",
        permission: "network.list",
        grantee: "test",
      },
    },
  },
  {
    data: {
      json: {
        type: "global_permission_revoked",
        source: "http",
        time: "2019-07-25T12:03:25.315Z",
        publisher: "root",
        permission: "network.list",
        revokee: "test",
      },
    },
  },
];
const addUnknownPropertyToPermission = items => {
  items.forEach(item => {
    item.data.json.additionalUnknownProperty = true;
  });
};
const makePermissionItemsInvalid = items => {
  items.forEach(item => {
    delete item.data.json.permission;
  });
};

const globalPermissionTestcase: Testcase = {
  stream: "permissions",
  streamItems: globalPermissionStreamItems,
  addUnknownProperty: addUnknownPropertyToPermission,
  makeItemsInvalid: makePermissionItemsInvalid,
};

// Node stream item testcase preperation
const nodeStreamItems: any[] = [
  {
    data: {
      json: {
        type: "node_registered",
        source: "system",
        publisher: "root",
        address: "9vqnbcXq",
        organization: "test",
        time: "2019-07-25T12:03:25.315Z",
      },
    },
  },
];
const addUnknownPropertyToNode = items => {
  items.forEach(item => {
    item.data.json.additionalUnknownProperty = true;
  });
};
const makeNodeItemsInvalid = items => {
  items.forEach(item => {
    delete item.data.json.organization;
  });
};

const nodeTestcase: Testcase = {
  stream: "nodes",
  streamItems: nodeStreamItems,
  addUnknownProperty: addUnknownPropertyToNode,
  makeItemsInvalid: makeNodeItemsInvalid,
};

testcases.push(projectTestcase);
testcases.push(subprojectTestcase);
testcases.push(workflowitemTestcase);
testcases.push(userTestcase);
testcases.push(groupTestcase);
testcases.push(notificationTestcase);
testcases.push(globalPermissionTestcase);
testcases.push(nodeTestcase);

describe("stream item validation (backwards-compatibility)", () => {
  for (const testcase of testcases) {
    context("for " + testcase.stream + " stream items", async () => {
      it("validates conformat items", async () => {
        const parsedEvents = parseBusinessEvents(testcase.streamItems, testcase.stream);
        assert.isOk(parsedEvents.every(result => Result.isOk(result)));
      });
      it("validates items with additional unknown property", async () => {
        testcase.addUnknownProperty(testcase.streamItems);
        const parsedEvents = parseBusinessEvents(testcase.streamItems, testcase.stream);
        assert.isOk(
          parsedEvents.every(
            result => Result.isOk(result) && !result.hasOwnProperty("additionalUnknownProperty"),
          ),
        );
      });
      it("doesn't validate invalid items", async () => {
        testcase.makeItemsInvalid(testcase.streamItems);
        const parsedEvents = parseBusinessEvents(testcase.streamItems, testcase.stream);
        assert.isOk(parsedEvents.every(result => Result.isErr(result)));
      });
    });
  }
});
