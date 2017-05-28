import {Task} from "./task";
import {AttaskPolicy} from "./attask-policy";
import {AttaskMode} from "./attask-mode";
import {AttaskState} from "./attask-state";
import {AttaskListener} from "./attask-listener";
import {AttaskTask} from "./attask-task";

export class AttaskBatch<P> {

    constructor(private tasks: Task<P>[],
                private policy: AttaskPolicy,
                private mode: () => AttaskMode,
                private errorListener: () => AttaskListener<P, any>,
                private onFailedHandler: (reason:any) => any,
                private silent: () => boolean) {
    }

    private error(message:any, task:Task<P>) {
        const handler:AttaskListener<P, any> = this.errorListener();

        if (!this.silent() && handler) {
            if(typeof handler === 'function') {
                handler(message, task);
            } else {
                handler.onEvent(message, task);
            }
        }
    };

    private finish(batch:AttaskTask, isError: boolean, message: any, task: Task<P>) {
        if ((this.policy === AttaskPolicy.MUST && isError)
         || (this.policy === AttaskPolicy.WONT && !isError)) {
            this.error(message, task);

            this.onFailedHandler(message);

            batch.failed = true;
        } else if(this.policy === AttaskPolicy.MIGHT && isError) {

            this.error(message, task);
        }
    };

    private execute(
        batch:AttaskTask,
        provider:P,
        state: AttaskState,
        task: Task<P>
    ): Promise<any> {

        if (batch.failed) {
            return Promise.resolve();
        }

        let promise:Promise<boolean>;

        try {
            if(typeof task === 'function') {
                promise = task(provider, state);
            } else {
                promise = task.run(provider, state);
            }
        } catch (error) {
            this.finish(batch, true, error, task);
        }

        return Promise.resolve(promise)
            .then(result => this.finish(batch, false, result, task))
            .catch(error => this.finish(batch, false, error, task));
    };

    run(provider: () => P, state: AttaskState): AttaskTask {
        const batch = new AttaskTask();

        if (this.tasks.length === 0) {
            batch.promise = Promise.resolve(true);

            return batch;
        }


        let promise:Promise<any>;

        if (this.mode() === AttaskMode.SYNC) {
            promise = this.tasks.reduce((
                promise,
                task
            ) => promise.then(() => this.execute(
                batch,
                provider(),
                state,
                task
            )), Promise.resolve());
        } else {
            promise = Promise.all(this.tasks.map(task => this.execute(
                batch,
                provider(),
                state,
                task
            )))
        }

        batch.promise = promise.then(() => !batch.failed);

        return batch;
    }

}
