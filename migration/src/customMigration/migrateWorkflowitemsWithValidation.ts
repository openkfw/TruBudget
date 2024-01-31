import Joi from "joi";
import {difference} from "../assert";
import {getFromTxOutData, getStreamItemByTx} from "../helper/migrationHelper";
import {MigrateFunction, MigrationCompleted, MigrationStatus, MoveFunction, VerifyParams,} from "../migrate";
import {createStreamItem} from "../rpc";
import {Item} from "../types/item";
import {EVENT_PARSER_MAP, eventDoesNotRequireValidation} from "../validators";

const PROJECT_VIEW_SUMMERY_PERMISSION = "project.viewSummary"
const PROJECT_LIST_PERMISSION = "project.list"

const SUBPROJECT_VIEW_SUMMERY_PERMISSION = "subproject.viewSummary"
const SUBPROJECT_LIST_PERMISSION = "subproject.list"
const SUBPROJECT_UPDATE = "subproject_updated"

const WORKFLOW_ITEM_UPDATE = "workflowitem_updated"
const WORKFLOWITEM_VIEW_PERMISSION = "workflowitem.view"
const WORKFLOWITEM_LIST_PERMISSION = "workflowitem.list"
const WORKFLOW_ITEM_CREATE = "workflowitem_created"


const setPermission = (newPermission: string, item: Item): Item => {
  ((item.data.json) as any).permission = newPermission;
  return item;
}



export const makeProjectUploader = (projectId: string): MigrateFunction => {
  return {
    stream: projectId,
    function: async (params: MoveFunction): Promise<MigrationCompleted> => {
      const { sourceChain, destinationChain, item, stream } = params;
      try {
        if (!item.available)
          return {
            status: MigrationStatus.Failed,
          };
        let itemToMigrate: Item = item;
        const txId = item.txid;

        const eventType = itemToMigrate.data.json.type


        //Do some revalidation with the most important events. If it fails, fail migration
        if (EVENT_PARSER_MAP[eventType] && !eventDoesNotRequireValidation(eventType)) {
          const validationResult = EVENT_PARSER_MAP[eventType].validate(itemToMigrate.data.json)
          if (validationResult.isError) {
            const errorTrace = validationResult.data as Joi.ValidationError
            // The CTX referes to what EVENT caused the issue 
            const ctx = errorTrace.details?.at(0)?.context.value
            // Error details tells us what HAPPENED
            const errorDetails = errorTrace.details?.at(0).message;

            // Rewrite intnet project.viewSummery to project.list as V2.x does not have this permission anymore
            if (ctx && ctx === PROJECT_VIEW_SUMMERY_PERMISSION) {
              console.log("Rewrite project.viewSummery to project.list")
              itemToMigrate = setPermission(PROJECT_LIST_PERMISSION, item)
            }
            // Rewrite subproject.viewSummery to subproject.list as V2.x does not have this permission anymore
            else if (ctx && ctx === SUBPROJECT_VIEW_SUMMERY_PERMISSION) {
              console.log("Rewrite subproject.viewSummery to subproject.list")
              itemToMigrate = setPermission(SUBPROJECT_LIST_PERMISSION, item)
            }
            // Rewrite workflowitem.view to workflowitem.list
            else if (ctx && ctx === WORKFLOWITEM_VIEW_PERMISSION) {
              console.log("Rewrite workflowitem.view to workflowitem.list")
              itemToMigrate = setPermission(WORKFLOWITEM_LIST_PERMISSION, item)
            }
            // Skipping subproject updates with empty update field
            else if (eventType === SUBPROJECT_UPDATE && errorDetails.includes("\"update\" is required")) {
              console.log("Skipping subproject_update event with no update field")
              return {
                sourceChainTx: txId,
                status: MigrationStatus.Skipped
              };

            }
            // Skipping workflow update events with empty update field
            else if (eventType === WORKFLOW_ITEM_UPDATE && errorDetails.includes("\"update\" is required")) {
              console.log("Skipping workflowitem_update event with no update field")
              return {
                sourceChainTx: txId,
                status: MigrationStatus.Skipped
              };

            }
            // Skipping workflow update events with empty file name field
            else if (
              (eventType === WORKFLOW_ITEM_UPDATE && errorDetails.includes("\"update.documents[0].fileName\" is required"))
            ) {

              ((itemToMigrate.data.json)as any).workflowitem.documents = []
              console.log("workflow_item update with document rewritten")
            }
            else if (eventType === WORKFLOW_ITEM_CREATE && errorDetails.includes("\"workflowitem.documents[0].fileName\" is required")) {
              //Remove the document as we want to upload it using the update endpoint from the API
              ((itemToMigrate.data.json)as any).workflowitem.documents = []
              console.log("workflow_item create with document rewritten")
            }
          }

        } else if (eventDoesNotRequireValidation(eventType)) {
          console.log(`Event ${eventType} does not require validation - skipped.`)
        }
        else {
          throw new Error("An event has been detected which is not compatible with TruBudget 2.x!")
        }


        // Default way to migrate item
        const req = await createStreamItem(
          destinationChain,
          stream,
          item.keys,
          itemToMigrate
        );

        return {
          sourceChainTx: txId,
          destinationChainTx: req,
          status: MigrationStatus.Ok,
        };
      } catch (error) {
        console.error(
          `Error while migrating item with txid ${params.item.txid} with ${error}. 
          The item will be skipped. Please check if ignoring this event is safe and does not lead to invalid data.`,
          params.item,
          error
        );
        return {
          status: MigrationStatus.Skipped,
        };
      }
    },
    verifier: async (params: VerifyParams): Promise<boolean> => {
      const cry = (original, clone, diff) => console.error(
        "User Assertion Failed! Original and clone are not the same! Original is: ",
        JSON.stringify(original),
        "Clone is: ",
        JSON.stringify(clone),
        "Difference is: ",
        JSON.stringify(diff)
      );

      const {
        sourceChain,
        stream,
        destinationChain,
        sourceChainTx,
        destinationChainTx,
        status,
        additionalData,
      } = params

      let clone = await getStreamItemByTx(
        destinationChain,
        stream,
        destinationChainTx
      );
      let original = await getStreamItemByTx(sourceChain, stream, sourceChainTx);
      if (!original || !clone) {
        throw new Error("User Assertion Failed! Original or clone is undefined");
      }
      if (
        original.data &&
        original.data.hasOwnProperty("vout") &&
        original.data.hasOwnProperty("txid")
      ) {
        original = await getFromTxOutData(sourceChain, original);
      }

      if (
        clone.data &&
        clone.data.hasOwnProperty("vout") &&
        clone.data.hasOwnProperty("txid")
      ) {
        clone = await getFromTxOutData(destinationChain, clone);
      }
      const diff = difference(original.data, clone.data);

      // if there is a difference, which we did not cause (i.e. by renaming permissions), escalate
      if (
        !diff ||
        Object.keys(diff).length !== 0 ||
        !Object.getPrototypeOf(diff) === Object.prototype
      ) {

        const orginalEventType = original.data.json.type
        const cloneEventType = clone.data.json.type

        // Event type has changed
        if (orginalEventType !== cloneEventType) {
          // Clone event is valid
          if (EVENT_PARSER_MAP[cloneEventType] && !eventDoesNotRequireValidation(cloneEventType)) {
            const originalIsValid = EVENT_PARSER_MAP[orginalEventType].validate(original.data.json)
            const cloneIsValid = EVENT_PARSER_MAP[cloneEventType].validate(clone.data.json)
            if(originalIsValid.isError || cloneIsValid.isError) {
              cry(original, clone, diff)
              return false;
            }
            console.log("Found difference in event type - this is fine as the event has probably been changed by the migration function")
            return true;
          }

        }
        return true;
      }
    },
  };
};
