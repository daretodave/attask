# Attask 
An approach to conditional promise chains with state and providers.

```javascript
const Attask = require("attask");

Attask
  .sync()
  .store({secret: 10});
  .provide([0, 1, 2])
  .must(
      collection => collection.push(4),
      (collection, store) => collection.push(store.get("secret"))
  )
  .finally(console.log)
  .run()
```

The above example will output **[0, 1, 2, 4, 10]**

## Getting Started

[![npm version](https://badge.fury.io/js/attask.svg)](https://badge.fury.io/js/attask)

```
npm install --save attask 
```

Attask can be instantiated in a couple of ways but the simplest way to create a new chain with the static methods **async** or **sync**

Attask.async() tells attask to execute the task chains in *parallel* -
```javascript
Attask
  .async()
  .must(
      () => new Promise((resolve, reject) => setTimeout(() => {
        console.log("A");
        resolve(); // Simulate background task with timeout
      }, 2500))
      () => console.log("B"),
      () => console.log("C")
  )
  .finally(() => console.log("DONE"));
.run();
```
Output 
- 0ms:   B 
- 0ms:   C
- 2.5ms: A
- 2.5ms: DONE

Attask.sync() in contrast, will guarantee execute the tasks *sequentially* -
```javascript
Attask
  .sync()
  .must(
      () => new Promise((resolve, reject) => setTimeout(() => {
        console.log("A");
        resolve(); // Simulate background task with timeout
      }, 2500))
      () => console.log("B"),
      () => console.log("C")
  )
  .finally(() => console.log("DONE"));
.run();
```
Output 
- 2.5ms: A 
- 2.5ms: B
- 2.5ms: C
- 2.5ms: DONE

## Must, Might or Wont
In order to populate chains with actions you use the methods **must**, **might**, or **wont**.

- Tasks added with **must** will abort all other tasks and pending tasks on failure
- Tasks added with **wont** must fail and will abort all other tasks and pending tasks on success
- Tasks added with **might** will not cancel other tasks when failed 

Tasks in must and might and wont groupings will execute in parallel even with the **sync** flag.  

```javascript
Attask
  .must(
    () => console.log("A"),
    () => console.log("B")
  )
  .might(
    () => console.log("C")
  )
  .wont(
    () => throw Error("Intentional Error")
  )
.run()
```

## Tasks

Tasks provided can be one of two things.

A function that accepts the provider and store. *Can return a promise* for async execution.
```javascript
function task(provider, store) {
  //...
}

//...
.must(
  task,
  task,
  task
)
```

A class that implements the run method that accepts the provider and store. This can also return a promise
```javascript
class Task {
  
  function run(provider, store) {
    //...
  }

}

//...
.must(
  Task
  Task
  Task
)
```

## Provider
Attask chains can be provided an attachment for the current work load. This attachment will be used as the first argument for a task callback.
```javascript
const attask = Attask.provide([]); // An empty array is the provider

attask.must(collection => collection.push(0));

attask.finally(console.log);

attask.run(); //Will log "[0]"
```

## State
Attask chains can be passed a state that is then abstracted in to a store object. This store object will be used as the second argument for a task callback
```javascript
Attask
  .provide(app)
  .store({ logger: "debug" })
  .must(
    (app, store) => app.use(logger(store.get("logger"))),
    app => app.use(cors())
  )
.run();
```

Here's a list of the methods available on the store -
```typescript
    resolve<T>(key:string):T;
    has(key:string):boolean;
    set(key:string, entry:any):AttaskStore;
    remove(key:string):AttaskStore;
    keys():string[];
    collect<T>(...key: string[]): T[];
    hasAny(...keys: string[]): boolean;
    hasNone(...keys: string[]): boolean;
    hasAll(...keys: string[]): boolean;
    has(key: string): boolean;
    resolve<T>(key: string): T;
    get<T>(key: string, ifNotFound?: T): {};
    any<T>(...keys: any[]): AttaskOptional<T>;
    all<T>(...keys: any[]): AttaskOptional<T>[];
    absorb(source: AttaskStore | any): void;
```

Note, you can also **store** an object that implements the first **5** methods above. Attask will see the object's signature and expand the task store with that object's elements.

## Optionals

AttaskOptional objects returned from **any** or **all** have the following methods
```typescript
is(...resolution):boolean
exists():boolean
get(ifNotFound:T = null):T
```

## Chaining

To append another attask chain use the **after** method
```javascript
Attask
  .must(() => console.log("A"))
  .after()
  .must(() => console.log("B")) //A brand new attask chain
.run()
```

By default a child chain will not use the provider available in the parent or the store available in the parent, when changed.

In order to keep this connection alive you can use the *link* directive to let attask know that the child chain relies on the parent provider even when changed.

```javascript
const parent = Attask.must(() => console.log("A"));
const child = parent.after().must(() => console.log("B"));

child.link(); //Will inherit any configuration changes

parent.provide([]); //child will now have this provider because it was linked

```

## Errors

Use **catch** to use your own error handler, by default attask's error handler is a console.error call.
```javascript
Attask
  .must(() => throw new Error("Oops"))
  .catch(error => console.error("ERROR", error)
.run();
```

## Silence 

In order to disable error handling without a *noop* function for catch, you can simply use the *silence* directive

```javascript
Attask
  .must(() => throw new Error("Oops"))
  .silence()
.run();
```

## All methods available on *Attask* (@see attask.d.ts)
```typescript
    sync(): Attask<P>;
    static sync<P>(): Attask<P>;
    async(): Attask<P>;
    static async<P>(): Attask<P>;
    store(source: AttaskStore | any): Attask<P>;
    static store<P>(source: AttaskStore | any): Attask<P>;
    absorb(source: AttaskStore | any): Attask<P>;
    provide(provider: P): Attask<P>;
    static provide<P>(provider: P): Attask<P>;
    must(...task: TaskerTask<P>[]): Attask<P>;
    static must<P>(...task: TaskerTask<P>[]): Attask<P>;
    wont(...task: TaskerTask<P>[]): Attask<P>;
    static wont<P>(...task: TaskerTask<P>[]): Attask<P>;
    might(...task: TaskerTask<P>[]): Attask<P>;
    static might<P>(...task: TaskerTask<P>[]): Attask<P>;
    catch(handler: AttaskListener<P, any> | any): Attask<P>;
    static catch<P>(handler: AttaskListener<P, any> | any): Attask<P>;
    silence(): Attask<P>;
    static silence<P>(): Attask<P>;
    unsilence(): Attask<P>;
    static unsilence<P>(): Attask<P>;
    link(): Attask<P>;
    static link<P>(): Attask<P>;
    unlink(): Attask<P>;
    static unlink<P>(): Attask<P>;
    finally(batchCompletion: AttaskListener<P, AttaskResult<P>> | any): Attask<P>;
    after(): Attask<P>;
    run(provider?: P, config?: AttaskState): any;
```

----
If you got this far, you can tell this documentation needs some work. 

Please feel free to fork and contribute in any way possible. 
