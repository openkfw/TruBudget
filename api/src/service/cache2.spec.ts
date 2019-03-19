import { assert } from "chai";
import * as isEmpty from "lodash.isempty";

import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { initCache, updateAggregates } from "./cache2";
import * as ProjectCreated from "../service/domain/workflow/project_created";
import * as ProjectClosed from "../service/domain/workflow/project_closed";
import * as ProjectAssigned from "../service/domain/workflow/project_assigned";
import * as SubprojectCreated from "../service/domain/workflow/subproject_created";
import * as SubprojectClosed from "../service/domain/workflow/subproject_closed";
import * as SubprojectAssigned from "../service/domain/workflow/subproject_assigned";
import { BusinessEvent } from "./domain/business_event";

describe("cache_updateAggregates", () => {
  context("aggregate projects", async () => {
    const defaultCtx: Ctx = {
      requestId: "",
      source: "http",
    };

    it("from scratch", async () => {
      const cache = initCache();

      assert.isTrue(isEmpty(cache.cachedProjects));

      const projectId = "id";
      const projectCreationEvent = ProjectCreated.createEvent("http", "test", {
        id: projectId,
        status: "open",
        displayName: "name",
        description: "description",
        projectedBudgets: [],
        permissions: {},
        additionalData: {},
      });

      updateAggregates(defaultCtx, cache, [projectCreationEvent]);
      assert.isFalse(isEmpty(cache.cachedProjects));
      assert.isFalse(isEmpty(cache.cachedProjects.get(projectId)));
    });

    it("from preexisting state", async () => {
      // Prefill cache
      const cache = initCache();
      const projectId = "id";
      const projectCreationEvent = ProjectCreated.createEvent("http", "test", {
        id: projectId,
        status: "open",
        displayName: "name",
        description: "description",
        projectedBudgets: [],
        permissions: {},
        additionalData: {},
      });
      updateAggregates(defaultCtx, cache, [projectCreationEvent]);

      // Apply events to existing cache
      const testAssignee = "shiba";
      const projectAssignedEvent = ProjectAssigned.createEvent(
        "http",
        "test",
        projectId,
        testAssignee,
      );
      const projectCloseEvent = ProjectClosed.createEvent("http", "test", projectId);
      if (Result.isErr(projectAssignedEvent)) {
        return assert.fail(undefined, undefined, "Project assgined event failed");
      }
      updateAggregates(defaultCtx, cache, [projectAssignedEvent, projectCloseEvent]);

      const projectUnderTest = cache.cachedProjects.get(projectId);
      if (!projectUnderTest) {
        return assert.fail(undefined, undefined, "Project not found");
      }
      assert.isTrue(!isEmpty(projectUnderTest));
      assert.strictEqual(projectUnderTest.status, "closed", "Project should be closed");
    });
  });

  context("aggregate subprojects", async () => {
    const defaultCtx: Ctx = {
      requestId: "",
      source: "http",
    };

    it("from scratch", async () => {
      const cache = initCache();
      assert.isTrue(isEmpty(cache.cachedSubprojects));

      const projectId = "p-id";
      const subprojectId = "s-id";
      const subProjectCreationEvent = SubprojectCreated.createEvent("http", "test", projectId, {
        id: subprojectId,
        status: "open",
        displayName: "name",
        description: "description",
        projectedBudgets: [],
        currency: "EUR",
        permissions: {},
        additionalData: {},
      });

      updateAggregates(defaultCtx, cache, [subProjectCreationEvent]);
      assert.isFalse(isEmpty(cache.cachedSubprojects));
      assert.isFalse(isEmpty(cache.cachedSubprojects.get(subprojectId)));
    });

    // TODO: add as soon as Subproject is implemented
    // it("from preexisting state", async () => {
    //   // Prefill cache
    //   const cache = initCache();
    //   assert.isTrue(isEmpty(cache.cachedSubprojects));

    //   const projectId = "p-id";
    //   const subprojectId = "s-id";
    //   const spCreationEvent = SubprojectCreated.createEvent("http", "test", projectId, {
    //     id: subprojectId,
    //     status: "open",
    //     displayName: "name",
    //     description: "description",
    //     projectedBudgets: [],
    //     currency: "EUR",
    //     permissions: {},
    //     additionalData: {},
    //   });

    //   updateAggregates(defaultCtx, cache, [spCreationEvent]);

    //   // Apply events to existing cache
    //   const testAssignee = "shiba";
    //   const spAssginedEvent = SubprojectAssigned.createEvent(
    //     "http",
    //     "test",
    //     projectId,
    //     subprojectId,
    //     testAssignee,
    //   );
    //   const spCloseEvent = SubprojectClosed.createEvent("http", "test", projectId, subprojectId);
    //   if (Result.isErr(spAssginedEvent)) {
    //     return assert.fail(undefined, undefined, "Subproject assigned event failed");
    //   }
    //   updateAggregates(defaultCtx, cache, [spAssginedEvent, spCloseEvent]);

    //   const spUnderTest = cache.cachedSubprojects.get(subprojectId);
    //   if (!spUnderTest) {
    //     return assert.fail(undefined, undefined, "Subproject not found");
    //   }
    //   assert.isTrue(!isEmpty(spUnderTest));
    //   assert.strictEqual(
    //     spUnderTest.status,
    //     "closed",
    //     `Subproject should be closed: ${JSON.stringify(spUnderTest, null, 2)}`,
    //   );
    // });
    it("generates lookup", async () => {
      const cache = initCache();

      const events: BusinessEvent[] = [];

      // Generate 5 Subprojects linked to 2 Projects
      // p-id0 -> s-id0 | p-id0 -> s-id2 | p-id0 -> s-id4
      // and
      // p-id1 -> s-id1 | p-id1 -> s-id3
      for (let i = 0; i <= 4; i++) {
        const projectId = `p-id${i % 2}`;
        const subprojectId = `s-id${i}`;
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
});
