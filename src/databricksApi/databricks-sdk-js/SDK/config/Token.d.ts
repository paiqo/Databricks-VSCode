import { Provider } from "../types";
import { RequestVisitor } from "./Config";
export type TokenProvider = Provider<Token>;
export declare class Token {
    readonly accessToken: string;
    readonly refreshToken: string | undefined;
    readonly expiry: number;
    constructor(options: {
        accessToken: string;
        refreshToken?: string;
        expiry?: number;
    });
    isValid(): boolean;
}
export declare function refreshableTokenProvider(source: TokenProvider): RequestVisitor;
//# sourceMappingURL=Token.d.ts.map