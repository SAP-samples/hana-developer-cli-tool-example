/// <reference types="node" />
export const assert: typeof assertInt;
export namespace mochaHooks {
    function beforeAll(): void;
    function afterAll(): void;
}
import * as assertInt from 'assert';
