import { CancellationToken } from "../../types";
export declare class TokenFixture implements CancellationToken {
    private listeners;
    get isCancellationRequested(): boolean;
    onCancellationRequested(f: (e?: any) => any): void;
}
//# sourceMappingURL=TokenFixtures.d.ts.map