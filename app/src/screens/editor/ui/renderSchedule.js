import { assert, unused } from "../../../common/utils.js";

var renderSchedule;

// https://stackoverflow.com/a/17386803
function canvasIsBlank(context) {
    let pixelBuffer = new Uint32Array(context.getImageData(0, 0, context.canvas.width, context.canvas.height).data.buffer);
  
    return !pixelBuffer.some(color => color !== 0);
}

class ScheduleTask {
    constructor(pdfPage, priorityLevel, pdfJsRenderConfig) {
        this.pdfPage = pdfPage;
        this.priorityLevel = priorityLevel;
        this.pdfJsRenderConfig = pdfJsRenderConfig;

        // Filled in when attended.
        this.pdfJsTask = null;
        this.numRenderAttempts = 0;
    }
}

// TODO: Do we want to cancel old tasks when a higher-priority task comes along? Probably a bad idea
// since rendering thumbnails will be reasonably fast?
class RenderSchedule {
    // Maximum number of render tasks that can run concurrently.
    // TODO: Can we get a recommended number from the OS?
    static MAX_NUM_RENDER_TASKS = 4;

    // Lower = more urgent.
    static PRIORITY_LEVEL_THE_ACTIVE_PAGE = 0;
    // TODO: Implement the distinction between visible and out-of-view thumbnails in the thumbnail bar.
    static PRIORITY_LEVEL_THE_VISIBLE_THUMBNAILS = 1;
    static PRIORITY_LEVEL_THE_OTHER_THUMBNAILS = 2;
    static MAX_PRIORITY_LEVEL = 2;
    static NUM_PRIORITY_LEVELS = RenderSchedule.MAX_PRIORITY_LEVEL + 1;

    constructor() {
        this.priorityBuckets = [];
        for (let i = 0; i < RenderSchedule.NUM_PRIORITY_LEVELS; i++) {
            // Set of render tasks.
            this.priorityBuckets[i] = new Set();
        }

        // Set representing <= MAX_NUM_RENDER_TASKS slots that can be filled by one the highest-priority tasks.
        this.runningTasks = new Set();
    }

    createTask(pdfPage, initialPriorityLevel, pdfJsRenderConfig) {
        let task = new ScheduleTask(pdfPage, initialPriorityLevel, pdfJsRenderConfig);
        this.addTaskToBucket(task);
        this.attendHighestPriorityTask();

        return task;
    }

    destroyTask(task) {
        if (this.taskIsRunning(task)) {
            task.pdfJsTask.cancel();
            // No need to remove the task from the runningTasks set,
            // this will happen when we handle PDFJS's promise.
        } else {
            this.deleteTaskFromBucket(task);
        }
    }

    addTaskToBucket(task) {
        this.priorityBuckets[task.priorityLevel].add(task);
    }

    deleteTaskFromBucket(task) {
        this.priorityBuckets[task.priorityLevel].delete(task);
    }

    taskIsRunning(task) {
        return this.runningTasks.has(task);
    }

    reprioritizeTask(scheduleTask, newPriorityLevel) {
        let isRunning = this.taskIsRunning(scheduleTask);

        if (!isRunning) {
            this.deleteTaskFromBucket(scheduleTask);
        }

        // This does have an effect I guess, due to our blank-canvas hack.
        scheduleTask.priorityLevel = newPriorityLevel;

        if (!isRunning) {
            this.addTaskToBucket(scheduleTask);
        }
    }

    pickHighestPriorityTask() {
        for (let priorityLevel = 0; 
             priorityLevel <= RenderSchedule.MAX_PRIORITY_LEVEL; 
             priorityLevel++)
        {
            let priorityBucket = this.priorityBuckets[priorityLevel];
            if (priorityBucket.size > 0) {
                // Pick any.
                return priorityBucket.values().next().value;
            }
        }

       return null;
    }

    attendHighestPriorityTask() {
        if (this.runningTasks.size >= RenderSchedule.MAX_NUM_RENDER_TASKS) {
            return false;
        }

        let highestPriorityTask = this.pickHighestPriorityTask();
        if (highestPriorityTask === null) {
            return false;
        }

        highestPriorityTask.pdfJsTask = highestPriorityTask.pdfPage.pdfJsPage.render(highestPriorityTask.pdfJsRenderConfig);

        this.deleteTaskFromBucket(highestPriorityTask);
        this.runningTasks.add(highestPriorityTask);

        (async () => {
            try {
                await highestPriorityTask.pdfJsTask.promise;
                this.currentRenderTask = null;
            } catch (e) {
                // This happens when the task was cancelled.
                unused(e);
            }

            this.runningTasks.delete(highestPriorityTask);

            // HACK: PDFJS seems to sporadically not render into some canvasses, even though my debugging attempts
            // seem to indicate that we *are* in fact calling and we finishing successfully. This only seems
            // to be the case on Firefox ...
            // So check its work.
            if (canvasIsBlank(highestPriorityTask.pdfJsRenderConfig.canvasContext)) {
                let shouldRetry = false;
                if (highestPriorityTask.numRenderAttempts === 0) {
                    shouldRetry = true;
                } else if (highestPriorityTask.numRenderAttempts === 1) {
                    // Wait and retry.
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    shouldRetry = true;
                }

                if (shouldRetry) {
                    this.addTaskToBucket(highestPriorityTask);
                } else {
                    // Give up.
                    assert(false);
                }

                highestPriorityTask.numRenderAttempts++;
            }

            this.attendWaitingTasks();
        })();

        return true;
    }

    attendWaitingTasks() {
        while (this.attendHighestPriorityTask()) {
            continue;
        }
    }
}

renderSchedule = new RenderSchedule();

export { RenderSchedule, renderSchedule };