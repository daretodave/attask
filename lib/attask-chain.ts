import {AttaskPolicy} from "./attask-policy";
import {AttaskBatch} from "./attask-batch";
import {AttaskTask} from "./attask-task";
import {AttaskMode} from "./attask-mode";
import {AttaskListener} from "./attask-listener";
import {AttaskState} from "./attask-state";
import {AttaskResult} from "./attask-result";

export class AttaskChain<P> {

    private map: Map<AttaskPolicy, any[]> = new Map<AttaskPolicy, any[]>();

    constructor(private provider: () => P,
                private configuration: () => AttaskState,
                private mode: () => AttaskMode,
                private errorListener: () => AttaskListener<P,any>,
                private silent: () => boolean) {

        this.map.set(AttaskPolicy.MIGHT, []);
        this.map.set(AttaskPolicy.MUST, []);
        this.map.set(AttaskPolicy.WONT, []);
    }

    push(policy: AttaskPolicy, ...tasks: any[]) {
        this.map.get(policy).push(...tasks);
    }

    resolve(completeListener:AttaskListener<P, AttaskResult<P>> = null): Promise<boolean> {

        return new Promise<boolean>((resolve: (success: boolean) => any, reject: (reason: any) => any) => {

            const configuration = this.configuration();

            let isFailure: boolean = false;

            let tasks: AttaskTask<P>[] = [];

            const complete = (isError:boolean, error:any) => {
                if (completeListener) {

                    const result:AttaskResult<P> = {
                        attachment: this.provider(),
                        state: configuration,
                        isError:isError,
                        error: error,
                        tasks:tasks
                    };

                    if(completeListener["onEvent"] && typeof completeListener.onEvent  === 'function') {
                        completeListener.onEvent(result, null);
                    } else {
                        (<any>completeListener)(result);
                    }
                }

                if(isError) {
                    reject(error);
                } else {
                    resolve(isFailure);
                }

            };

            const failure = error => {
                tasks.forEach(task => task.failed = true);

                isFailure = true;

                complete(true, error);
            };

            const batch = (policy: AttaskPolicy) => new AttaskBatch<P>(
                this.map.get(policy),
                policy,
                this.mode,
                this.errorListener,
                failure,
                this.silent
            );

            tasks.push(
                batch(AttaskPolicy.MUST).run(this.provider, configuration),
                batch(AttaskPolicy.WONT).run(this.provider, configuration),
                batch(AttaskPolicy.MIGHT).run(this.provider, configuration)
            );

            Promise.all(tasks.map(task => task.promise))
                .then(() => complete(isFailure, null))
                .catch(failure);
        });



    }

}