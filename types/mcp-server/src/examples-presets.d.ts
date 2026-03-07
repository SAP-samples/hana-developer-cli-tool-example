/**
 * Command examples and parameter presets for better discoverability
 */
export interface CommandExample {
    scenario: string;
    description: string;
    parameters: Record<string, any>;
    notes?: string;
    expectedOutput?: string;
}
export interface ParameterPreset {
    name: string;
    description: string;
    parameters: Record<string, any>;
    notes?: string;
    whenToUse?: string;
}
export interface CommandExamplesData {
    command: string;
    examples: CommandExample[];
}
export interface CommandPresetsData {
    command: string;
    presets: ParameterPreset[];
}
/**
 * Command examples library
 */
export declare const COMMAND_EXAMPLES: Record<string, CommandExample[]>;
/**
 * Parameter presets for common use cases
 */
export declare const COMMAND_PRESETS: Record<string, ParameterPreset[]>;
/**
 * Get examples for a command
 */
export declare function getCommandExamples(command: string): CommandExample[];
/**
 * Get presets for a command
 */
export declare function getCommandPresets(command: string): ParameterPreset[];
/**
 * Check if command has examples
 */
export declare function hasExamples(command: string): boolean;
/**
 * Check if command has presets
 */
export declare function hasPresets(command: string): boolean;
/**
 * Get all commands with examples
 */
export declare function getCommandsWithExamples(): string[];
/**
 * Get all commands with presets
 */
export declare function getCommandsWithPresets(): string[];
