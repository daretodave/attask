export class AttaskTask {

    constructor(public failed:boolean = false) {
    }

    promise:Promise<boolean>;

}