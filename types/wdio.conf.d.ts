export namespace config {
    let runner: string;
    let specs: string[];
    let exclude: never[];
    let maxInstances: number;
    let capabilities: {
        maxInstances: number;
        browserName: string;
        acceptInsecureCerts: boolean;
        'goog:chromeOptions': {
            args: string[];
        };
    }[];
    let logLevel: string;
    let bail: number;
    let baseUrl: string;
    let waitforTimeout: number;
    let connectionRetryTimeout: number;
    let connectionRetryCount: number;
    namespace wdi5 {
        let logLevel_1: string;
        export { logLevel_1 as logLevel };
        export let waitForUI5Timeout: number;
        export let screenshotPath: string;
        export let screenshotsDisabled: boolean;
        export let btpWorkZoneEnablement: boolean;
        export let skipInjectUI5OnStart: boolean;
    }
    function before(): Promise<void>;
    let services: (string | (string | {
        screenshotPath: string;
        screenshotsDisabled: boolean;
        logLevel: string;
        waitForUI5Timeout: number;
        btpWorkZoneEnablement: boolean;
    })[])[];
    let framework: string;
    let reporters: string[];
    namespace mochaOpts {
        let ui: string;
        let timeout: number;
    }
}
