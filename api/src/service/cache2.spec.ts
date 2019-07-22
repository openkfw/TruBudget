import { assert } from "chai";
import * as isEmpty from "lodash.isempty";

import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as ProjectAssigned from "../service/domain/workflow/project_assigned";
import * as ProjectClosed from "../service/domain/workflow/project_closed";
import * as ProjectCreated from "../service/domain/workflow/project_created";
import * as SubprojectAssigned from "../service/domain/workflow/subproject_assigned";
import * as SubprojectClosed from "../service/domain/workflow/subproject_closed";
import * as SubprojectCreated from "../service/domain/workflow/subproject_created";
import * as WorkflowitemAssigned from "../service/domain/workflow/workflowitem_assigned";
import * as WorkflowitemClosed from "../service/domain/workflow/workflowitem_closed";
import * as WorkflowitemCreated from "../service/domain/workflow/workflowitem_created";
import {
  Cache2,
  getCacheInstance,
  initCache,
  parseBusinessEvents,
  updateAggregates,
} from "./cache2";
import { NotFound } from "./domain/errors/not_found";

describe("The cache updates", () => {
  context("project aggregates", async () => {
    const defaultCtx: Ctx = {
      requestId: "",
      source: "http",
    };

    it("from scratch", async () => {
      // Setup test with empty cache
      const cache = initCache();
      assert.isTrue(isEmpty(cache.cachedProjects));

      // Add project and check if it in the aggregate
      const projectId = "id";
      addExampleProject(defaultCtx, cache, projectId);
      assert.isFalse(isEmpty(cache.cachedProjects));
      assert.isFalse(isEmpty(cache.cachedProjects.get(projectId)));
    });

    it("from preexisting state", async () => {
      // Setup test by prefilling cache with a project
      const cache = initCache();
      const projectId = "id";
      addExampleProject(defaultCtx, cache, projectId);

      // Apply events to existing cache
      const testAssignee = "shiba";
      const projectAssignedEvent = ProjectAssigned.createEvent(
        "http",
        "test",
        projectId,
        testAssignee,
      );

      if (Result.isErr(projectAssignedEvent)) throw projectAssignedEvent;
      const projectCloseEvent = ProjectClosed.createEvent("http", "test", projectId);
      if (Result.isErr(projectCloseEvent)) throw projectCloseEvent;
      updateAggregates(defaultCtx, cache, [projectAssignedEvent, projectCloseEvent]);

      // Test if events have been reflected on the aggregate
      const projectUnderTest = cache.cachedProjects.get(projectId);
      if (!projectUnderTest) {
        return assert.fail(undefined, undefined, "Project not found");
      }
      assert.isTrue(!isEmpty(projectUnderTest));
      assert.strictEqual(projectUnderTest.status, "closed", "Project should be closed");
    });
  });

  context("subproject aggregates", async () => {
    const defaultCtx: Ctx = {
      requestId: "",
      source: "http",
    };

    it("from scratch", async () => {
      // Setup test with empty cache
      const cache = initCache();
      assert.isTrue(isEmpty(cache.cachedSubprojects));

      // Add subproject and check if it in the aggregate
      const projectId = "p-id";
      const subprojectId = "s-id";
      addExampleSubproject(defaultCtx, cache, projectId, subprojectId);

      assert.isFalse(isEmpty(cache.cachedSubprojects));
      assert.isFalse(isEmpty(cache.cachedSubprojects.get(subprojectId)));
    });

    it("from preexisting state", async () => {
      // Setup test by prefilling cache with a subproject
      const cache = initCache();
      const projectId = "p-id";
      const subprojectId = "s-id";
      addExampleSubproject(defaultCtx, cache, projectId, subprojectId);

      // Apply events to existing cache
      const testAssignee = "shiba";
      const spAssginedEvent = SubprojectAssigned.createEvent(
        "http",
        "test",
        projectId,
        subprojectId,
        testAssignee,
      );
      const spCloseEvent = SubprojectClosed.createEvent("http", "test", projectId, subprojectId);
      if (Result.isErr(spAssginedEvent)) {
        return assert.fail(undefined, undefined, "Subproject assigned event failed");
      }
      updateAggregates(defaultCtx, cache, [spAssginedEvent, spCloseEvent]);

      // Test if events have been reflected on the aggregate
      const spUnderTest = cache.cachedSubprojects.get(subprojectId);
      if (!spUnderTest) {
        return assert.fail(undefined, undefined, "Subproject not found");
      }
      assert.isTrue(!isEmpty(spUnderTest));
      assert.strictEqual(
        spUnderTest.status,
        "closed",
        `Subproject should be closed: ${JSON.stringify(spUnderTest, null, 2)}`,
      );
    });
    it("and generates lookup", async () => {
      // Setup test with 5 Subprojects linked to 2 Projects
      // p-id0 -> s-id0 | p-id0 -> s-id2 | p-id0 -> s-id4
      // and
      // p-id1 -> s-id1 | p-id1 -> s-id3
      const cache = initCache();
      for (let i = 0; i <= 4; i++) {
        const projectId = `p-id${i % 2}`;
        const subprojectId = `s-id${i}`;
        const spCreationEvent = addExampleSubproject(defaultCtx, cache, projectId, subprojectId);
      }

      // Check if lookup was generated
      const lookUp = cache.cachedSubprojectLookup;
      if (!lookUp) return assert.fail(undefined, undefined, "Lookup not found");

      // Check if lookup for the first project is correct
      const lookUpForFirstProject = lookUp.get("p-id0");
      if (!lookUpForFirstProject) {
        return assert.fail(undefined, undefined, "Lookup for first project not found");
      }
      assert.isFalse(isEmpty(lookUpForFirstProject));
      assert.hasAllKeys(lookUpForFirstProject, ["s-id0", "s-id2", "s-id4"]);

      // Check if lookup for the second project is correct
      const lookUpForSecondProject = lookUp.get("p-id1");
      if (!lookUpForSecondProject) {
        return assert.fail(undefined, undefined, "Lookup for second project not found");
      }
      assert.isFalse(isEmpty(lookUpForSecondProject));
      assert.hasAllKeys(lookUpForSecondProject, ["s-id1", "s-id3"]);
    });
  });

  context("workflowitem aggregates", async () => {
    const defaultCtx: Ctx = {
      requestId: "",
      source: "http",
    };

    it("from scratch", async () => {
      // Setup test with empty cache
      const cache = initCache();

      // Add workflowitem and check if it in the aggregate
      const projectId = "p-id";
      const subprojectId = "s-id";
      const workflowitemId = "w-id";
      addExampleWorkflowitem(defaultCtx, cache, projectId, subprojectId, workflowitemId);

      assert.isFalse(isEmpty(cache.cachedWorkflowItems));
      assert.isFalse(isEmpty(cache.cachedWorkflowItems.get(workflowitemId)));
    });

    it("from preexisting state", async () => {
      // Setup test by prefilling cache with a subproject
      const cache = initCache();
      const projectId = "p-id";
      const subprojectId = "s-id";
      const workflowitemId = "w-id";
      addExampleWorkflowitem(defaultCtx, cache, projectId, subprojectId, workflowitemId);

      // Apply events to existing cache
      const testAssignee = "shiba";
      const wfAssignedEvent = WorkflowitemAssigned.createEvent(
        "http",
        "test",
        projectId,
        subprojectId,
        workflowitemId,
        testAssignee,
      );
      if (Result.isErr(wfAssignedEvent)) {
        return assert.fail(undefined, undefined, "Workflowitem assigned event failed");
      }
      const wfCloseEvent = WorkflowitemClosed.createEvent(
        "http",
        "test",
        projectId,
        subprojectId,
        workflowitemId,
      );
      if (Result.isErr(wfCloseEvent)) {
        return assert.fail(undefined, undefined, "Workflowitem closed event failed");
      }
      updateAggregates(defaultCtx, cache, [wfAssignedEvent, wfCloseEvent]);

      // Test if events have been reflected on the aggregate
      const wfUnderTest = cache.cachedWorkflowItems.get(workflowitemId);
      if (!wfUnderTest) {
        return assert.fail(undefined, undefined, "Workflowitem not found");
      }
      assert.isTrue(!isEmpty(wfUnderTest));
      assert.strictEqual(
        wfUnderTest.status,
        "closed",
        `Workflowitem should be closed: ${JSON.stringify(wfUnderTest, null, 2)}`,
      );
    });

    it("and generates lookup", async () => {
      // Setup test with 5 Workflowitems linked to 2 Subprojects
      // s-id0 -> w-id0 | s-id0 -> w-id2 | s-id0 -> w-id4
      // and
      // s-id1 -> w-id1 | s-id1 -> w-id3
      const cache = initCache();

      for (let i = 0; i <= 4; i++) {
        const projectId = "p-id";
        const subprojectId = `s-id${i % 2}`;
        const workflowitemId = `w-id${i}`;
        addExampleWorkflowitem(defaultCtx, cache, projectId, subprojectId, workflowitemId);
      }

      // Check if lookup was generated
      const lookUp = cache.cachedWorkflowitemLookup;
      if (!lookUp) return assert.fail(undefined, undefined, "Lookup not found");

      // Check if lookup for the first subproject is correct
      const lookUpForFirstSubproject = lookUp.get("s-id0");
      if (!lookUpForFirstSubproject) {
        return assert.fail(undefined, undefined, "Lookup for first Subproject not found");
      }
      assert.isFalse(isEmpty(lookUpForFirstSubproject));
      assert.hasAllKeys(lookUpForFirstSubproject, ["w-id0", "w-id2", "w-id4"]);

      // Check if lookup for the second subproject is correct
      const lookUpForSecondSubproject = lookUp.get("s-id1");
      if (!lookUpForSecondSubproject) {
        return assert.fail(undefined, undefined, "Lookup for second Subproject not found");
      }
      assert.isFalse(isEmpty(lookUpForSecondSubproject));
      assert.hasAllKeys(lookUpForSecondSubproject, ["w-id1", "w-id3"]);
    });
  });
});

describe("The cache", () => {
  const defaultCtx: Ctx = {
    requestId: "",
    source: "http",
  };
  context("for project aggregates", async () => {
    it("returns an existing project", async () => {
      // Setting up the test with an example project
      const cache = initCache();
      const { project: exampleProject } = addExampleProject(defaultCtx, cache, "pid");
      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Test if added project can be retrieved
      const responseFromCache = await cacheInstance.getProject(exampleProject.id);
      assert.isOk(Result.isOk(responseFromCache));

      const project = Result.unwrap(responseFromCache);

      const actual = { projectId: project.id, displayName: project.displayName };
      const expected = { projectId: exampleProject.id, displayName: exampleProject.displayName };
      assert.deepEqual(
        actual,
        expected,
        `Project from cache doesn't match project that has been added: ${JSON.stringify(
          actual,
          null,
          2,
        )} !== ${JSON.stringify(expected, null, 2)}`,
      );
    });
    it("fails if project can't be found", async () => {
      // Setting up test with example project
      const cache = initCache();
      addExampleProject(defaultCtx, cache, "pid");
      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Checking that getting a non-existant project return a "NotFound"-Error
      const responseFromCache = await cacheInstance.getProject("otherid");
      assert.isNotOk(Result.isOk(responseFromCache));
      assert.instanceOf(Result.unwrap_err(responseFromCache), NotFound);
    });

    it("returns a list of existing projects", async () => {
      // Setting up thest with 2 projects
      const cache = initCache();
      addExampleProject(defaultCtx, cache, "pid");
      addExampleProject(defaultCtx, cache, "pid2");
      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Checking if list contains the 2 projects
      const responseFromCache = await cacheInstance.getProjects();
      assert.isOk(Result.isOk(responseFromCache));
      const projectList = Result.unwrap(responseFromCache);
      assert.lengthOf(projectList, 2);
    });

    it("returns an empty list if no project exist", async () => {
      // Setting up test with an empty cache
      const cache = initCache();
      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Check that an empty list is returned
      const responseFromCache = await cacheInstance.getProjects();
      assert.isOk(Result.isOk(responseFromCache));
      const projectList = Result.unwrap(responseFromCache);
      assert.lengthOf(projectList, 0);
    });
  });
  context("for subproject aggregates", async () => {
    it("returns an existing subproject", async () => {
      // Setting up an example project containing a single subproject
      const cache = initCache();
      const projectId = "pid";
      addExampleProject(defaultCtx, cache, projectId);
      addExampleSubproject(defaultCtx, cache, projectId, "to_be_ignored");
      const { subproject: example } = addExampleSubproject(defaultCtx, cache, projectId, "sid");

      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Check if subproject in cache matches the created one
      const responseFromCache = await cacheInstance.getSubproject(projectId, example.id);
      assert.isOk(Result.isOk(responseFromCache));

      const subproject = Result.unwrap(responseFromCache);

      const actual = { subprojectId: example.id, displayName: example.displayName };
      const expected = { subprojectId: subproject.id, displayName: subproject.displayName };
      assert.deepEqual(
        actual,
        expected,
        `Subproject from cache doesn't match project that has been added: ${JSON.stringify(
          actual,
          null,
          2,
        )} !== ${JSON.stringify(expected, null, 2)}`,
      );
    });
    it("fails if subproject can't be found", async () => {
      // Setup test with a project containing some subprojects (they will be ignored)
      const cache = initCache();
      const projectId = "pid";
      addExampleProject(defaultCtx, cache, projectId);
      addExampleSubproject(defaultCtx, cache, projectId, "sid");
      addExampleSubproject(defaultCtx, cache, projectId, "sid2");

      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Get a non-existing subproject and check if it fails
      const responseFromCache = await cacheInstance.getSubproject(projectId, "otherid");
      assert.isNotOk(Result.isOk(responseFromCache));
      assert.instanceOf(Result.unwrap_err(responseFromCache), NotFound);
    });
    it("returns a list of subprojects", async () => {
      // Setup test with a project containing 4 subprojects
      const cache = initCache();
      const projectId = "pid";
      addExampleProject(defaultCtx, cache, projectId);
      const amountOfSubprojects = 4;
      for (let i = 0; i < amountOfSubprojects; i++) {
        addExampleSubproject(defaultCtx, cache, projectId, `sid${i}`);
      }

      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Check if 4 subprojects are in the list
      const responseFromCache = await cacheInstance.getSubprojects(projectId);
      assert.isOk(Result.isOk(responseFromCache));
      const list = Result.unwrap(responseFromCache);
      assert.lengthOf(list, amountOfSubprojects);
    });
    it("fails to return list if project doesnt exist", async () => {
      // Setup test with a project containing 4 subprojects
      const cache = initCache();
      const projectId = "pid";
      addExampleProject(defaultCtx, cache, projectId);
      const amountOfSubprojects = 4;
      for (let i = 0; i < amountOfSubprojects; i++) {
        addExampleSubproject(defaultCtx, cache, projectId, `sid${i}`);
      }

      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Check that trying to list subprojects from an non-existing project fails
      const responseFromCache = await cacheInstance.getSubprojects("non_existing_project");
      assert.isNotOk(Result.isOk(responseFromCache));
      assert.instanceOf(Result.unwrap_err(responseFromCache), NotFound);
    });
  });
  context("workflowitem aggregates", async () => {
    it("returns an existing workflowitem", async () => {
      // Setting up an example workflowitem
      const cache = initCache();
      const projectId = "pid";
      const subprojectId = "sid";
      const workflowitemId = "wid";
      addExampleProject(defaultCtx, cache, projectId);
      addExampleSubproject(defaultCtx, cache, projectId, subprojectId);
      const { workflowitem: example } = addExampleWorkflowitem(
        defaultCtx,
        cache,
        projectId,
        subprojectId,
        workflowitemId,
      );

      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Check if workflowitem in cache matches the created one
      const responseFromCache = await cacheInstance.getWorkflowitem(
        projectId,
        subprojectId,
        example.id,
      );
      assert.isOk(Result.isOk(responseFromCache));

      const workflowitem = Result.unwrap(responseFromCache);

      const actual = { workflowitemId: example.id, displayName: example.displayName };
      const expected = { workflowitemId: workflowitem.id, displayName: workflowitem.displayName };
      assert.deepEqual(
        actual,
        expected,
        `Workflowitem from cache doesn't match project that has been added: ${JSON.stringify(
          actual,
          null,
          2,
        )} !== ${JSON.stringify(expected, null, 2)}`,
      );
    });
    it("fails if workflowitem can't be found", async () => {
      // Setup test with a workflowitem (it will be ignored)
      const cache = initCache();
      const projectId = "pid";
      const subprojectId = "sid";
      const workflowitemId = "wid";

      addExampleProject(defaultCtx, cache, projectId);
      addExampleSubproject(defaultCtx, cache, projectId, subprojectId);
      addExampleWorkflowitem(defaultCtx, cache, projectId, subprojectId, workflowitemId);

      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Get a non-existing workflowitem and check if it fails
      const responseFromCache = await cacheInstance.getWorkflowitem(
        projectId,
        subprojectId,
        "otherid",
      );
      assert.isNotOk(Result.isOk(responseFromCache));
      assert.instanceOf(Result.unwrap_err(responseFromCache), NotFound);
    });
    it("returns a list of workflowitems", async () => {
      // Setup test with a project containing a subproject containing 4 workflowitems
      const cache = initCache();
      const projectId = "pid";
      const subprojectId = "sid";
      addExampleProject(defaultCtx, cache, projectId);
      addExampleSubproject(defaultCtx, cache, projectId, subprojectId);
      const amountOfWorkflowitems = 4;
      for (let i = 0; i < amountOfWorkflowitems; i++) {
        addExampleWorkflowitem(defaultCtx, cache, projectId, subprojectId, `wid${i}`);
      }

      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Check if 4 workflowitems are in the list
      const responseFromCache = await cacheInstance.getWorkflowitems(projectId, subprojectId);
      assert.isOk(Result.isOk(responseFromCache));
      const list = Result.unwrap(responseFromCache);
      assert.lengthOf(list, amountOfWorkflowitems);
    });
    it("fails to return list if subproject doesnt exist", async () => {
      // Setup test with a project containing a subproject containing 4 workflowitems
      const cache = initCache();
      const projectId = "pid";
      const subprojectId = "sid";
      addExampleProject(defaultCtx, cache, projectId);
      addExampleSubproject(defaultCtx, cache, projectId, subprojectId);
      const amountOfWorkflowitems = 4;
      for (let i = 0; i < amountOfWorkflowitems; i++) {
        addExampleWorkflowitem(defaultCtx, cache, projectId, subprojectId, `wid${i}`);
      }

      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Check that trying to list workflowitems from an non-existing subproject fails
      const responseFromCache = await cacheInstance.getWorkflowitems(
        "non_existing_project",
        "non_existing_subproject",
      );
      assert.isNotOk(Result.isOk(responseFromCache));
      assert.instanceOf(Result.unwrap_err(responseFromCache), NotFound);
    });
  });

  describe("The BusinessEvent parsing", () => {
    context("project events", async () => {
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
      const addUnknownProperty = items => {
        items.map(item => {
          item.data.json.project.additionalUnknownProperty = true;
          return item;
        });
        return items;
      };
      const makeItemsInvalid = items => {
        items.map(item => {
          delete item.data.json.project.id;
        });
        return items;
      };
      testParsingEvents("projectStream", projectStreamItems, addUnknownProperty, makeItemsInvalid);
    });
    context("subproject events", async () => {
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
      const addUnknownProperty = items => {
        items.map(item => {
          item.data.json.subproject.additionalUnknownProperty = true;
          return item;
        });
        return items;
      };
      const makeItemsInvalid = items => {
        items.map(item => {
          delete item.data.json.subproject.id;
        });
        return items;
      };
      testParsingEvents(
        "projectStream",
        subprojectStreamItems,
        addUnknownProperty,
        makeItemsInvalid,
      );
    });
    context("workflowitem events", async () => {
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
      ];
      const addUnknownProperty = items => {
        items.map(item => {
          item.data.json.workflowitem.additionalUnknownProperty = true;
          return item;
        });
        return items;
      };
      const makeItemsInvalid = items => {
        items.map(item => {
          delete item.data.json.workflowitem.id;
        });
        return items;
      };
      testParsingEvents(
        "projectStream",
        workflowitemStreamItems,
        addUnknownProperty,
        makeItemsInvalid,
      );
    });
    context("user events", async () => {
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
      const addUnknownProperty = items => {
        items.map(item => {
          item.data.json.user.additionalUnknownProperty = true;
          return item;
        });
        return items;
      };
      const makeItemsInvalid = items => {
        items.map(item => {
          delete item.data.json.user.id;
        });
        return items;
      };
      testParsingEvents("usersStream", userStreamItems, addUnknownProperty, makeItemsInvalid);
    });
    context("group events", async () => {
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
      const addUnknownProperty = items => {
        items.map(item => {
          item.data.json.group.additionalUnknownProperty = true;
          return item;
        });
        return items;
      };
      const makeItemsInvalid = items => {
        items.map(item => {
          delete item.data.json.group.id;
        });
        return items;
      };
      testParsingEvents("usersStream", groupStreamItems, addUnknownProperty, makeItemsInvalid);
    });
    context("notification events", async () => {
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
              notificationId: "7f4f0085-e962-4171-b100-1c9c200cb035",
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
      const addUnknownProperty = items => {
        items.map(item => {
          item.data.json.additionalUnknownProperty = true;
          return item;
        });
        return items;
      };
      const makeItemsInvalid = items => {
        items.map(item => {
          delete item.data.json.notificationId;
        });
        return items;
      };
      testParsingEvents(
        "notificationsStream",
        notificationStreamItems,
        addUnknownProperty,
        makeItemsInvalid,
      );
    });
    context("global permission events", async () => {
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
      const addUnknownProperty = items => {
        items.map(item => {
          item.data.json.additionalUnknownProperty = true;
          return item;
        });
        return items;
      };
      const makeItemsInvalid = items => {
        items.map(item => {
          delete item.data.json.permission;
        });
        return items;
      };
      testParsingEvents(
        "globalStream",
        globalPermissionStreamItems,
        addUnknownProperty,
        makeItemsInvalid,
      );
    });
    context("node events", async () => {
      const globalPermissionStreamItems: any[] = [
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
      const addUnknownProperty = items => {
        items.map(item => {
          item.data.json.additionalUnknownProperty = true;
          return item;
        });
        return items;
      };
      const makeItemsInvalid = items => {
        items.map(item => {
          delete item.data.json.organization;
        });
        return items;
      };
      testParsingEvents(
        "nodesStream",
        globalPermissionStreamItems,
        addUnknownProperty,
        makeItemsInvalid,
      );
    });
  });
});

function testParsingEvents(
  stream: string,
  streamItems: any[],
  addUnknownProperty,
  makeItemsInvalid,
) {
  it("parse valid items", async () => {
    const parsedEvents = parseBusinessEvents(streamItems, stream);
    assert.isOk(parsedEvents.every(result => Result.isOk(result)));
  });
  it("parse items ignoring unknown properties", async () => {
    const parsedEvents = parseBusinessEvents(addUnknownProperty(streamItems), stream);
    assert.isOk(
      parsedEvents.every(
        result => Result.isOk(result) && !result.hasOwnProperty("additionalUnknownProperty"),
      ),
    );
  });
  it("rejects invalid items", async () => {
    const parsedEvents = parseBusinessEvents(makeItemsInvalid(streamItems), stream);
    assert.isOk(parsedEvents.every(result => Result.isErr(result)));
  });
}

// Helper functions
function addExampleProject(ctx: Ctx, cache: Cache2, projectId: string): ProjectCreated.Event {
  const projectCreationEvent = ProjectCreated.createEvent("http", "test", {
    id: projectId,
    status: "open",
    displayName: "name",
    description: "description",
    projectedBudgets: [],
    permissions: {},
    additionalData: {},
  });

  updateAggregates(ctx, cache, [projectCreationEvent]);

  return projectCreationEvent;
}

function addExampleSubproject(
  ctx: Ctx,
  cache: Cache2,
  projectId: string,
  subprojectId: string,
): SubprojectCreated.Event {
  const spCreationEvent = SubprojectCreated.createEvent("http", "test", projectId, {
    id: subprojectId,
    status: "open",
    displayName: "name",
    description: "description",
    projectedBudgets: [],
    currency: "EUR",
    permissions: {},
    additionalData: {},
  });

  updateAggregates(ctx, cache, [spCreationEvent]);

  return spCreationEvent;
}

function addExampleWorkflowitem(
  ctx: Ctx,
  cache: Cache2,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
): WorkflowitemCreated.Event {
  const wfCreationEvent = WorkflowitemCreated.createEvent("http", "test", projectId, subprojectId, {
    id: workflowitemId,
    status: "open",
    displayName: "name",
    description: "description",
    amountType: "N/A",
    permissions: {},
    documents: [],
    additionalData: {},
  });

  updateAggregates(ctx, cache, [wfCreationEvent]);

  return wfCreationEvent;
}
