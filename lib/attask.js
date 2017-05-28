"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const attask_chain_1 = require("./attask-chain");
const attask_state_1 = require("./attask-state");
const attask_policy_1 = require("./attask-policy");
const attask_mode_1 = require("./attask-mode");
class Attask {
    constructor(parent, provider, attaskState, attaskMode) {
        this.parent = parent;
        this.provider = provider;
        this.attaskState = attaskState;
        this.attaskMode = attaskMode;
        this.errorHandler = error => console.error(error);
        this.silent = false;
        this.linked = false;
        this.chain = new attask_chain_1.AttaskChain(() => (this.linked && this.parent) ? parent.provider : this.provider, () => (this.linked && this.parent) ? parent.attaskState : attaskState, () => (this.linked && this.parent) ? parent.attaskMode : this.attaskMode, () => (this.linked && this.parent) ? parent.errorHandler : this.errorHandler, () => (this.linked && this.parent) ? parent.silent : this.silent);
    }
    sync() {
        this.attaskMode = attask_mode_1.AttaskMode.SYNC;
        return this;
    }
    static sync() {
        return new Attask(null, null, new attask_state_1.AttaskState({}), attask_mode_1.AttaskMode.SYNC);
    }
    async() {
        this.attaskMode = attask_mode_1.AttaskMode.ASYNC;
        return this;
    }
    static async() {
        return new Attask(null, null, new attask_state_1.AttaskState({}), attask_mode_1.AttaskMode.ASYNC);
    }
    store(source) {
        this.attaskState = new attask_state_1.AttaskState(source);
        return this;
    }
    static store(source) {
        return new Attask(null, null, source, attask_mode_1.AttaskMode.ASYNC);
    }
    absorb(source) {
        this.attaskState.absorb(source);
        return this;
    }
    provide(provider) {
        this.provider = provider;
        return this;
    }
    static provide(provider) {
        return new Attask(null, provider, new attask_state_1.AttaskState({}), attask_mode_1.AttaskMode.ASYNC);
    }
    must(...task) {
        this.chain.push(attask_policy_1.AttaskPolicy.MUST, ...task);
        return this;
    }
    static must(...task) {
        return this.async().must(...task);
    }
    wont(...task) {
        this.chain.push(attask_policy_1.AttaskPolicy.WONT, ...task);
        return this;
    }
    static wont(...task) {
        return this.async().wont(...task);
    }
    might(...task) {
        this.chain.push(attask_policy_1.AttaskPolicy.MIGHT, ...task);
        return this;
    }
    static might(...task) {
        return this.async().might(...task);
    }
    catch(handler) {
        this.errorHandler = handler;
        return this;
    }
    static catch(handler) {
        return this.async().catch(handler);
    }
    silence() {
        this.silent = true;
        return this;
    }
    static silence() {
        return this.async().silence();
    }
    unsilence() {
        this.silent = false;
        return this;
    }
    static unsilence() {
        return this.async().silence();
    }
    link() {
        this.linked = true;
        return this;
    }
    static link() {
        return this.async().link();
    }
    unlink() {
        this.linked = false;
        return this;
    }
    static unlink() {
        return this.async().unlink();
    }
    then(linked = true) {
        this.child = new Attask(this, this.provider, this.attaskState, this.attaskMode);
        this.child.linked = linked;
        return this.child;
    }
    run(provider = this.provider, config = this.attaskState) {
        if (this.parent) {
            return this.parent.run(provider, config);
        }
        return this.chain.resolve().then(result => {
            if (this.child !== null) {
                return this.child
                    .run(provider, config)
                    .then(childResult => result && childResult);
            }
            return result;
        });
    }
}
exports.default = Attask;
var attask_batch_1 = require("./attask-batch");
exports.AttaskBatch = attask_batch_1.AttaskBatch;
var attask_chain_2 = require("./attask-chain");
exports.AttaskChain = attask_chain_2.AttaskChain;
var attask_mode_2 = require("./attask-mode");
exports.AttaskMode = attask_mode_2.AttaskMode;
var attask_optional_1 = require("./attask-optional");
exports.AttaskOptional = attask_optional_1.AttaskOptional;
var attask_policy_2 = require("./attask-policy");
exports.AttaskPolicy = attask_policy_2.AttaskPolicy;
var attask_simple_store_1 = require("./attask-simple-store");
exports.AttaskSimpleStore = attask_simple_store_1.AttaskSimpleStore;
var attask_state_2 = require("./attask-state");
exports.AttaskState = attask_state_2.AttaskState;
var attask_task_1 = require("./attask-task");
exports.AttaskTask = attask_task_1.AttaskTask;
//# sourceMappingURL=attask.js.map