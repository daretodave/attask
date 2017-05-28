import {AttaskChain} from "./attask-chain";
import {AttaskListener} from "./attask-listener";
import {AttaskState} from "./attask-state";
import {Task, TaskerTask} from "./task";
import {AttaskPolicy} from "./attask-policy";
import {AttaskStore} from "./attask-store";
import {AttaskMode} from "./attask-mode";

export class Attask<P> implements Task<P> {

    private chain:AttaskChain<P>;
    private child:Attask<P>;
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

    static for<P>(provider:P, state:AttaskStore|any = {}) {
        return new Attask<P>(null, provider, state, AttaskMode.ASYNC);
    }

    for(provider:P):Attask<P> {
        this.provider = provider;
        return this;
    }

    sync():Attask<P> {
        this.attaskMode = AttaskMode.SYNC;
        return this;
    }

    async():Attask<P> {
        this.attaskMode = AttaskMode.ASYNC;
        return this;
    }

    state(source:AttaskStore|any): Attask<P> {
        this.attaskState = new AttaskState(source);
        return this;
    }

    absorb(source:AttaskStore|any): Attask<P> {
        this.attaskState.absorb(source);
        return this;
    }

    provide(provider:P): Attask<P> {
        this.provider = provider;
        return this;
    }

    must(...task:TaskerTask<P>[]):Attask<P> {
        this.chain.push(AttaskPolicy.MUST, ...task);

        return this;
    }

    wont(...task:TaskerTask<P>[]):Attask<P> {
        this.chain.push(AttaskPolicy.WONT, ...task);

        return this;
    }

    might(...task:TaskerTask<P>[]):Attask<P> {
        this.chain.push(AttaskPolicy.MIGHT, ...task);

        return this;
    }

    error(handler:AttaskListener<P>|any):Attask<P> {
        this.errorHandler = handler;

        return this;
    }

    silence():Attask<P> {
        this.silent = true;

        return this;
    }

    unsilence():Attask<P> {
        this.silent = false;

        return this;
    }

    link():Attask<P> {
        this.linked = true;

        return this;
    }

    unlink():Attask<P> {
        this.linked = false;

        return this;
    }

    then(linked:boolean = true):Attask<P> {
        this.child = new Attask<P>(this, this.provider, this.attaskState, this.attaskMode);
        this.child.linked = linked;

        return this.child;
    }

    run(provider: P = this.provider, config: AttaskState = this.attaskState) {
        if(this.parent) {
            return this.parent.run(provider, config);
        }

        return this.chain.resolve().then(result => {
            if(this.child !== null) {

                return this.child
                    .run(provider, config)
                    .then(childResult => result && childResult);
            }

            return result;
        })
    }

}