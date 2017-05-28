export interface AttaskConsumer {
    consume(result: any, error: any, index: number): any;
}
