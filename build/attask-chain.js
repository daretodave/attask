"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const attask_policy_1 = require("./attask-policy");
const attask_batch_1 = require("./attask-batch");
class AttaskChain {
    constructor(provider, configuration, mode, errorListener, silent) {
        this.provider = provider;
        this.configuration = configuration;
        this.mode = mode;
        this.errorListener = errorListener;
        this.silent = silent;
        this.map = new Map();
        this.map.set(attask_policy_1.AttaskPolicy.MIGHT, []);
        this.map.set(attask_policy_1.AttaskPolicy.MUST, []);
        this.map.set(attask_policy_1.AttaskPolicy.WONT, []);
    }
    push(policy, ...tasks) {
        this.map.get(policy).push(...tasks);
    }
    resolve() {
        return new Promise((resolve, reject) => {
            let isFailure = false;
            let tasks = [];
            const failure = error => {
                tasks.forEach(task => task.failed = true);
                isFailure = true;
                reject(error);
            };
            const batch = (policy) => new attask_batch_1.AttaskBatch(this.map.get(policy), policy, this.mode, this.errorListener, failure, this.silent);
            const configuration = this.configuration();
            tasks.push(batch(attask_policy_1.AttaskPolicy.MUST).run(this.provider, configuration), batch(attask_policy_1.AttaskPolicy.WONT).run(this.provider, configuration), batch(attask_policy_1.AttaskPolicy.MIGHT).run(this.provider, configuration));
            Promise.all(tasks.map(task => task.promise))
                .then(() => resolve(isFailure))
                .catch(failure);
        });
    }
}
exports.AttaskChain = AttaskChain;
//# sourceMappingURL=attask-chain.js.map