export declare function onlyNBytes(str: string, numBytes: number): string;
export declare class Redactor {
    private fieldNames;
    constructor(fieldNames?: string[]);
    addFieldName(fieldName: string): void;
    sanitize(obj?: any, dropFields?: string[], seen?: Set<any>): any;
}
export declare const defaultRedactor: Redactor;
//# sourceMappingURL=Redactor.d.ts.map