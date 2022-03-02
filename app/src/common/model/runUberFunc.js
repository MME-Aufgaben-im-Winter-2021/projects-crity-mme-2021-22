import { appwrite } from "./appwrite.js";

const UBERFUNC_ID = "uberFunc";

// Spaghetti Alert! Asynchronous programming at its finest ...
// TODO: Comment this reeeeeeeeeal good.
//
// Lots of insane code to handle function execution via promises.
// Main challenge is that we want to call resolve outside the callback,
// since we have to dispatch all promise resolvers from inside one
// big callback. Also, we have to be careful for when we receive a
// channel notification while we are waiting for the execution to be
// created.

var promiseResolversByExecutionId = [];
var responsesByExecutionId = [];

appwrite.subscribe(`functions.${UBERFUNC_ID}`, response => {
    if (response.event === "functions.executions.update") {
        let executionId = response.payload.$id;

        responsesByExecutionId[executionId] = response;
        let resolver = promiseResolversByExecutionId[executionId];
        if (typeof resolver !== "undefined") {
            resolver(response);
            delete responsesByExecutionId[executionId];

            delete promiseResolversByExecutionId[executionId];
        }
    }
});

async function runUberFunc() {
    // Note that we give up execution in here, single-threaded though we might be.
    let createExecutionResponse = await appwrite.functions.createExecution(UBERFUNC_ID);
    let executionId = createExecutionResponse.$id;

    let promise = new Promise((resolve, reject) => {
        let response = responsesByExecutionId[executionId];
        if (typeof response !== "undefined") {
            resolve(response);
            delete responsesByExecutionId[executionId];
        } else {
            promiseResolversByExecutionId[executionId] = resolve;
        }
    });
    
    return await promise;
}

export { runUberFunc };
