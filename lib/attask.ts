import {AttaskChain} from "./attask-chain";
import {AttaskListener} from "./attask-listener";
import {AttaskState} from "./attask-state";
import {Task, TaskerTask} from "./task";
import {AttaskPolicy} from "./attask-policy";
import {AttaskStore} from "./attask-store";
import {AttaskMode} from "./attask-mode";
import {AttaskResult} from "./attask-result";

export default class Attask<P> implements Task<P> {

    private chain:AttaskChain<P>;
    private child:Attask<P>;
    private completeHandler:any;
    private errorHandler:any;
    private silent:boolean;
    private linked:boolean;

    constructor(private parent:Attask<P>,
                private provider:P,
                private attaskState:AttaskState,
                private attaskMode:AttaskMode) {

        this.errorHandler = error => console.error(error);
        this.silent = false;
        this.linked = false;

        this.chain = new AttaskChain<P>(
            () => (this.linked && this.parent) ? parent.provider : this.provider,
            () => (this.linked && this.parent) ? parent.attaskState : attaskState,
            () => (this.linked && this.parent) ? parent.attaskMode :this.attaskMode,
            () => (this.linked && this.parent) ? parent.errorHandler :this.errorHandler,
            () => (this.linked && this.parent) ? parent.silent : this.silent
        );
    }


    sync():Attask<P> {
        this.attaskMode = AttaskMode.SYNC;
        return this;
    }

    static sync<P>(): Attask<P> {
        return new Attask<P>(null, null, new AttaskState({}), AttaskMode.SYNC);
    }

    async():Attask<P> {
        this.attaskMode = AttaskMode.ASYNC;
        return this;
    }

    static async<P>(): Attask<P> {
        return new Attask<P>(null, null, new AttaskState({}), AttaskMode.ASYNC);
    }

    store(source:AttaskStore|any): Attask<P> {
        this.attaskState = new AttaskState(source);
        return this;
    }

    static store<P>(source:AttaskStore|any) {
        return new Attask<P>(null, null, source, AttaskMode.ASYNC);
    }

    absorb(source:AttaskStore|any): Attask<P> {
        this.attaskState.absorb(source);
        return this;
    }

    provide(provider:P): Attask<P> {
        this.provider = provider;
        return this;
    }

    static provide<P>(provider:P): Attask<P> {
        return new Attask<P>(null, provider, new AttaskState({}), AttaskMode.ASYNC);
    }

    must(...task:TaskerTask<P>[]):Attask<P> {
        this.chain.push(AttaskPolicy.MUST, ...task);

        return this;
    }

    static must<P>(...task:TaskerTask<P>[]): Attask<P> {
        return this.async<P>().must(...task);
    }

    wont(...task:TaskerTask<P>[]):Attask<P> {
        this.chain.push(AttaskPolicy.WONT, ...task);

        return this;
    }

    static wont<P>(...task:TaskerTask<P>[]): Attask<P> {
        return this.async<P>().wont(...task);
    }

    might(...task:TaskerTask<P>[]):Attask<P> {
        this.chain.push(AttaskPolicy.MIGHT, ...task);

        return this;
    }

    static might<P>(...task:TaskerTask<P>[]): Attask<P> {
        return this.async<P>().might(...task);
    }

    catch(handler:AttaskListener<P,any>|any):Attask<P> {
        this.errorHandler = handler;

        return this;
    }

    static catch<P>(handler:AttaskListener<P,any>|any): Attask<P> {
        return this.async<P>().catch(handler);
    }

    silence():Attask<P> {
        this.silent = true;

        return this;
    }

    static silence<P>(): Attask<P> {
        return this.async<P>().silence();
    }

    unsilence():Attask<P> {
        this.silent = false;

        return this;
    }

    static unsilence<P>(): Attask<P> {
        return this.async<P>().silence();
    }

    link():Attask<P> {
        this.linked = true;

        return this;
    }

    static link<P>(): Attask<P> {
        return this.async<P>().link();
    }

    unlink():Attask<P> {
        this.linked = false;

        return this;
    }

    static unlink<P>(): Attask<P> {
        return this.async<P>().unlink();
    }

    finally(batchCompletion:AttaskListener<P, AttaskResult<P>>|any):Attask<P> {
        this.completeHandler = batchCompletion;

        return this;
    }

    after():Attask<P> {
        this.child = new Attask<P>(this, this.provider, this.attaskState, this.attaskMode);

        return this.child;
    }

    run(provider: P = this.provider, config: AttaskState = this.attaskState) {
        if(this.parent) {
            return this.parent.run(provider, config);
        }

        return this.chain.resolve(this.completeHandler).then(result => {
            if(this.child !== null) {

                return this.child
                    .run(provider, config)
                    .then(childResult => result && childResult);
            }
            return result;
        }).catch(error => {
            // ignore, handled else-wise
        })
    }

}

export {Attask};
export {AttaskBatch} from "./attask-batch";
export {AttaskChain} from "./attask-chain";
export {AttaskConsumer} from "./attask-consumer";
export {AttaskListener} from "./attask-listener";
export {AttaskMode} from "./attask-mode";
export {AttaskOptional} from "./attask-optional";
export {AttaskPolicy} from "./attask-policy";
export {AttaskSimpleStore} from "./attask-simple-store";
export {AttaskState} from "./attask-state";
export {AttaskStore} from "./attask-store";
export {AttaskTask} from "./attask-task";
export {Task} from "./task";