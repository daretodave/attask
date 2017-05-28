import {AttaskPolicy} from "./attask-policy";
import {AttaskBatch} from "./attask-batch";
import {AttaskTask} from "./attask-task";
import {AttaskMode} from "./attask-mode";
import {AttaskListener} from "./attask-listener";
import {AttaskState} from "./attask-state";

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

    resolve(): Promise<boolean> {

        return new Promise<boolean>((resolve: (success: boolean) => any, reject: (reason: any) => any) => {

            let isFailure: boolean = false;

            let tasks: AttaskTask[] = [];

            const failure = error => {
                tasks.forEach(task => task.failed = true);

                isFailure = true;

                reject(error);
            };

            const batch = (policy: AttaskPolicy) => new AttaskBatch<P>(
                this.map.get(policy),
                policy,
                this.mode,
                this.errorListener,
                failure,
                this.silent
            );

            const configuration = this.configuration();

            tasks.push(
                batch(AttaskPolicy.MUST).run(this.provider, configuration),
                batch(AttaskPolicy.WONT).run(this.provider, configuration),
                batch(AttaskPolicy.MIGHT).run(this.provider, configuration)
            );

            Promise.all(tasks.map(task => task.promise))
                .then(() => resolve(isFailure))
                .catch(failure);
        });



    }

}