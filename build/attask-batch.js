"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const attask_policy_1 = require("./attask-policy");
const attask_mode_1 = require("./attask-mode");
const attask_task_1 = require("./attask-task");
class AttaskBatch {
    constructor(tasks, policy, mode, errorListener, onFailedHandler, silent) {
        this.tasks = tasks;
        this.policy = policy;
        this.mode = mode;
        this.errorListener = errorListener;
        this.onFailedHandler = onFailedHandler;
        this.silent = silent;
    }
    error(message, task) {
        const handler = this.errorListener();
        if (!this.silent() && handler) {
            if (handler["onEvent"] && typeof handler.onEvent === 'function') {
                handler.onEvent(message, task);
            }
            else {
                handler(message, task);
            }
        }
    }
    ;
    finish(batch, isError, message, task) {
        if ((this.policy === attask_policy_1.AttaskPolicy.MUST && isError)
            || (this.policy === attask_policy_1.AttaskPolicy.WONT && !isError)) {
            this.error(message, task);
            this.onFailedHandler(message);
            batch.failed = true;
        }
        else if (this.policy === attask_policy_1.AttaskPolicy.MIGHT && isError) {
            this.error(message, task);
        }
    }
    ;
    execute(batch, task) {
        if (batch.failed) {
            return Promise.resolve();
        }
        let promise;
        try {
            promise = task.call(task, batch.provider, batch.state);
        }
        catch (error) {
            if (error && error.name === 'TypeError') {
                try {
                    const runner = new task();
                    if (runner["run"] && typeof runner["run"] === 'function') {
                        return this.execute(batch, runner["run"]);
                    }
                }
                catch (ignore) {
                    // Not a class and original error holds true!
                }
            }
            this.finish(batch, true, error, task);
        }
        return Promise.resolve(promise)
            .then(result => this.finish(batch, false, result, task))
            .catch(error => this.finish(batch, false, error, task));
    }
    ;
    run(provider, state) {
        const attachment = provider();
        const batch = new attask_task_1.AttaskTask(this.tasks, state, attachment);
        if (this.tasks.length === 0) {
            batch.promise = Promise.resolve(true);
            return batch;
        }
        let promise;
        if (this.mode() === attask_mode_1.AttaskMode.SYNC) {
            promise = this.tasks.reduce((promise, task) => promise.then(() => this.execute(batch, task)), Promise.resolve());
        }
        else {
            promise = Promise.all(this.tasks.map(task => this.execute(batch, task)));
        }
        batch.promise = promise.then(() => !batch.failed);
        return batch;
    }
}
exports.AttaskBatch = AttaskBatch;
//# sourceMappingURL=attask-batch.js.map