import { NamedLogger } from "../logging";
import { CancellationToken } from "../types";
export interface ContextItems {
    logger?: NamedLogger;
    opId?: string;
    opName?: string;
    rootClassName?: string;
    rootFnName?: string;
    cancellationToken?: CancellationToken;
}
export declare class Context {
    private _items;
    get logger(): NamedLogger | undefined;
    get opId(): string | undefined;
    get opName(): string | undefined;
    get rootClassName(): string | undefined;
    get rootFnName(): string | undefined;
    get cancellationToken(): CancellationToken | undefined;
    constructor(items?: ContextItems);
    setItems(items?: ContextItems): void;
    copy(): Context;
}
//# sourceMappingURL=Context.d.ts.map