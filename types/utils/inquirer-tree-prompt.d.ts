export class TreePrompt {
    constructor(questions: any, rl: any, answers: any);
    done: () => void;
    firstRender: boolean;
    tree: {
        children: any;
    };
    shownList: any[];
    opt: any;
    paginator: any;
    selectedList: any[];
    /**
     * @protected
     */
    protected _run(done: any): Promise<this>;
    _installKeyHandlers(): void;
    prepareChildrenAndRender(node: any): Promise<void>;
    prepareChildren(node: any): Promise<void>;
    runChildrenFunctionIfRequired(node: any): Promise<void>;
    cloneAndNormaliseChildren(node: any): void;
    validateAndFilterDescendants(node: any): Promise<void>;
    addValidity(node: any): Promise<void>;
    render(error: any): void;
    createTreeContent(node?: {
        children: any;
    }, indent?: number): string;
    active: any;
    shortFor(node: any, isFinal?: boolean): any;
    nameFor(node: any, isFinal?: boolean): any;
    valueFor(node: any): any;
    onError(state: any): void;
    onSubmit(state: any): void;
    status: string;
    onUpKey(): void;
    onDownKey(): void;
    onLeftKey(): void;
    onRightKey(): void;
    moveActive(distance?: number): void;
    onTabKey(): void;
    onSpaceKey(): void;
    toggleSelection(): void;
    toggleOpen(): void;
}
export default TreePrompt;
