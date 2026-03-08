/**
 * Resolve local connection credentials for E2E tests.
 * Priority: CDS bind > default-env-admin.json > default-env.json
 * @returns {Promise<NormalizedCredentials|null>}
 */
export function getLocalConnectionCredentials(): Promise<NormalizedCredentials | null>;
/**
 * @typedef {{
 *  force: boolean,
 *  isCI: boolean,
 *  forceEnvVarName: string
 * }} LiveTestControl
 */
/**
 * Resolve live test control flags from environment variables.
 * @param {string} forceEnvVarName
 * @returns {LiveTestControl}
 */
export function getLiveTestControl(forceEnvVarName: string): LiveTestControl;
/**
 * Skip test by default, or fail explicitly in forced-live mode.
 * @param {{ skip: () => void }} testContext
 * @param {(error?: Error) => void} done
 * @param {LiveTestControl} control
 * @param {string} reason
 * @returns {false}
 */
export function skipOrFailLiveTest(testContext: {
    skip: () => void;
}, done: (error?: Error) => void, control: LiveTestControl, reason: string): false;
/**
 * Gate optional live tests in CI unless explicitly forced.
 * @param {{ skip: () => void }} testContext
 * @param {(error?: Error) => void} done
 * @param {LiveTestControl} control
 * @param {string} testName
 * @returns {boolean}
 */
export function gateLiveTestInCI(testContext: {
    skip: () => void;
}, done: (error?: Error) => void, control: LiveTestControl, testName: string): boolean;
export type NormalizedCredentials = {
    kind: "hana" | "postgres" | "sqlite";
    connection?: string;
    user?: string;
    password?: string;
    database?: string;
    schema?: string;
    raw?: object;
};
export type LiveTestControl = {
    force: boolean;
    isCI: boolean;
    forceEnvVarName: string;
};
