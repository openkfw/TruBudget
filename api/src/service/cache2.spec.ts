import { assert } from "chai";
import * as isEmpty from "lodash.isempty";

import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { Cache2, initCache, updateAggregates, getCacheInstance } from "./cache2";
import * as ProjectCreated from "../service/domain/workflow/project_created";
import * as ProjectClosed from "../service/domain/workflow/project_closed";
import * as ProjectAssigned from "../service/domain/workflow/project_assigned";
import * as SubprojectCreated from "../service/domain/workflow/subproject_created";
import * as SubprojectAssigned from "../service/domain/workflow/subproject_assigned";
import * as SubprojectClosed from "../service/domain/workflow/subproject_closed";
import * as WorkflowitemCreated from "../service/domain/workflow/workflowitem_created";

import { BusinessEvent } from "./domain/business_event";
import { NotFound } from "./domain/errors/not_found";

describe("The cache updates", () => {
  context("project aggregates", async () => {
    const defaultCtx: Ctx = {
      requestId: "",
      source: "http",
    };

    it("from scratch", async () => {
      const cache = initCache();

      assert.isTrue(isEmpty(cache.cachedProjects));

      const projectId = "id";
      const projectCreationEvent = addExampleProject(defaultCtx, cache, projectId);

      updateAggregates(defaultCtx, cache, [projectCreationEvent]);
      assert.isFalse(isEmpty(cache.cachedProjects));
      assert.isFalse(isEmpty(cache.cachedProjects.get(projectId)));
    });

    it("from preexisting state", async () => {
      // Prefill cache
      const cache = initCache();
      const projectId = "id";
      const projectCreationEvent = addExampleProject(defaultCtx, cache, projectId);
      updateAggregates(defaultCtx, cache, [projectCreationEvent]);

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
      const cache = initCache();
      assert.isTrue(isEmpty(cache.cachedSubprojects));

      const projectId = "p-id";
      const subprojectId = "s-id";
      const subProjectCreationEvent = addExampleSubproject(
        defaultCtx,
        cache,
        projectId,
        subprojectId,
      );

      updateAggregates(defaultCtx, cache, [subProjectCreationEvent]);
      assert.isFalse(isEmpty(cache.cachedSubprojects));
      assert.isFalse(isEmpty(cache.cachedSubprojects.get(subprojectId)));
    });

    it("from preexisting state", async () => {
      // Prefill cache
      const cache = initCache();
      assert.isTrue(isEmpty(cache.cachedSubprojects));

      const projectId = "p-id";
      const subprojectId = "s-id";
      const spCreationEvent = addExampleSubproject(defaultCtx, cache, projectId, subprojectId);

      updateAggregates(defaultCtx, cache, [spCreationEvent]);

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
      const cache = initCache();

      const events: BusinessEvent[] = [];

      // Generate 5 Subprojects linked to 2 Projects
      // p-id0 -> s-id0 | p-id0 -> s-id2 | p-id0 -> s-id4
      // and
      // p-id1 -> s-id1 | p-id1 -> s-id3
      for (let i = 0; i <= 4; i++) {
        const projectId = `p-id${i % 2}`;
        const subprojectId = `s-id${i}`;
        const spCreationEvent = addExampleSubproject(defaultCtx, cache, projectId, subprojectId);
        events.push(spCreationEvent);
      }

      updateAggregates(defaultCtx, cache, events);

      // Check if lookup was generated
      const lookUp = cache.cachedSubprojectLookup;
      if (!lookUp) return assert.fail(undefined, undefined, "Lookup not found");

      // Check if lookup for the first project is correct
      const lookUpForFirstProject = lookUp.get("p-id0");
      if (!lookUpForFirstProject)
        return assert.fail(undefined, undefined, "Lookup for first project not found");
      assert.isFalse(isEmpty(lookUpForFirstProject));
      assert.hasAllKeys(lookUpForFirstProject, ["s-id0", "s-id2", "s-id4"]);

      // Check if lookup for the second project is correct
      const lookUpForSecondProject = lookUp.get("p-id1");
      if (!lookUpForSecondProject)
        return assert.fail(undefined, undefined, "Lookup for second project not found");
      assert.isFalse(isEmpty(lookUpForSecondProject));
      assert.hasAllKeys(lookUpForSecondProject, ["s-id1", "s-id3"]);
    });
  });
  context("workflowitem aggregates", async () => {
    const defaultCtx: Ctx = {
      requestId: "",
      source: "http",
    };

    it("and generates lookup", async () => {
      const cache = initCache();

      const events: BusinessEvent[] = [];

      // Generate 5 Workflowitems linked to 2 Subprojects
      // s-id0 -> w-id0 | s-id0 -> w-id2 | s-id0 -> w-id4
      // and
      // s-id1 -> w-id1 | s-id1 -> w-id3
      for (let i = 0; i <= 4; i++) {
        const projectId = "p-id";
        const subprojectId = `s-id${i % 2}`;
        const workflowitemId = `w-id${i}`;
        const wfCreationEvent = WorkflowitemCreated.createEvent(
          "http",
          "test",
          projectId,
          subprojectId,
          {
            id: workflowitemId,
            status: "open",
            displayName: "name",
            description: "description",
            amountType: "N/A",
            permissions: {},
            documents: [],
            additionalData: {},
          },
        );
        events.push(wfCreationEvent);
      }

      updateAggregates(defaultCtx, cache, events);

      // Check if lookup was generated
      const lookUp = cache.cachedWorkflowitemLookup;
      if (!lookUp) return assert.fail(undefined, undefined, "Lookup not found");

      // Check if lookup for the first subproject is correct
      const lookUpForFirstSubproject = lookUp.get("s-id0");
      if (!lookUpForFirstSubproject)
        return assert.fail(undefined, undefined, "Lookup for first Subproject not found");
      assert.isFalse(isEmpty(lookUpForFirstSubproject));
      assert.hasAllKeys(lookUpForFirstSubproject, ["w-id0", "w-id2", "w-id4"]);

      // Check if lookup for the second subproject is correct
      const lookUpForSecondSubproject = lookUp.get("s-id1");
      if (!lookUpForSecondSubproject)
        return assert.fail(undefined, undefined, "Lookup for second Subproject not found");
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
      const cache = initCache();
      const { project: exampleProject } = addExampleProject(defaultCtx, cache, "pid");

      const cacheInstance = getCacheInstance(defaultCtx, cache);

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
      const cache = initCache();
      addExampleProject(defaultCtx, cache, "pid");
      const cacheInstance = getCacheInstance(defaultCtx, cache);

      const responseFromCache = await cacheInstance.getProject("otherid");
      assert.isNotOk(Result.isOk(responseFromCache));
      assert.instanceOf(Result.unwrap_err(responseFromCache), NotFound);
    });

    it("returns a list of existing projects", async () => {
      const cache = initCache();
      addExampleProject(defaultCtx, cache, "pid");
      addExampleProject(defaultCtx, cache, "pid2");
      const cacheInstance = getCacheInstance(defaultCtx, cache);

      const responseFromCache = await cacheInstance.getProjects();
      assert.isOk(Result.isOk(responseFromCache));
      const projectList = Result.unwrap(responseFromCache);
      assert.lengthOf(projectList, 2);
    });

    it("returns an empty list if no project exist", async () => {
      const cache = initCache();
      const cacheInstance = getCacheInstance(defaultCtx, cache);

      const responseFromCache = await cacheInstance.getProjects();
      assert.isOk(Result.isOk(responseFromCache));
      const projectList = Result.unwrap(responseFromCache);
      assert.lengthOf(projectList, 0);
    });
  });
  context("for subproject aggregates", async () => {
    it("returns an existing subproject", async () => {
      // Setup test data
      const cache = initCache();
      const projectId = "pid";
      addExampleProject(defaultCtx, cache, projectId);
      addExampleSubproject(defaultCtx, cache, projectId, "to_be_ignored");
      const { subproject: example } = addExampleSubproject(defaultCtx, cache, projectId, "sid");

      const cacheInstance = getCacheInstance(defaultCtx, cache);

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
      // Setup test data
      const cache = initCache();
      const projectId = "pid";
      addExampleProject(defaultCtx, cache, projectId);
      addExampleSubproject(defaultCtx, cache, projectId, "sid");
      addExampleSubproject(defaultCtx, cache, projectId, "sid2");

      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Get with a non-existing ID should fail
      const responseFromCache = await cacheInstance.getSubproject(projectId, "otherid");
      assert.isNotOk(Result.isOk(responseFromCache));
      assert.instanceOf(Result.unwrap_err(responseFromCache), NotFound);
    });
    it("returns a list of subprojects", async () => {
      // setup test with 4 subprojects
      const cache = initCache();
      const projectId = "pid";
      addExampleProject(defaultCtx, cache, projectId);
      const amountOfSubprojects = 4;
      for (let i = 0; i < amountOfSubprojects; i++) {
        addExampleSubproject(defaultCtx, cache, projectId, `sid${i}`);
      }

      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Check if 4 subprojects are returned
      const responseFromCache = await cacheInstance.getSubprojects(projectId);
      assert.isOk(Result.isOk(responseFromCache));
      const list = Result.unwrap(responseFromCache);
      assert.lengthOf(list, amountOfSubprojects);
    });
    it("fails to return list if project doesnt exist", async () => {
      // setup test with 4 subprojects
      const cache = initCache();
      const projectId = "pid";
      addExampleProject(defaultCtx, cache, projectId);
      const amountOfSubprojects = 4;
      for (let i = 0; i < amountOfSubprojects; i++) {
        addExampleSubproject(defaultCtx, cache, projectId, `sid${i}`);
      }

      const cacheInstance = getCacheInstance(defaultCtx, cache);

      // Try to list subprojects from an non-existing project
      const responseFromCache = await cacheInstance.getSubprojects("non_existing_project");
      assert.isNotOk(Result.isOk(responseFromCache));
      assert.instanceOf(Result.unwrap_err(responseFromCache), NotFound);
    });
  });
});

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
