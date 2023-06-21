"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRedactor = exports.Redactor = exports.onlyNBytes = void 0;
function onlyNBytes(str, numBytes) {
    return str.length > numBytes
        ? str.slice(0, numBytes) + `...(${str.length - numBytes} more bytes)`
        : str;
}
exports.onlyNBytes = onlyNBytes;
function isPrimitveType(obj) {
    return Object(obj) !== obj;
}
class Redactor {
    constructor(fieldNames = []) {
        this.fieldNames = fieldNames;
    }
    addFieldName(fieldName) {
        this.fieldNames.push(fieldName);
    }
    sanitize(obj, dropFields = [], seen = new Set()) {
        if (typeof obj === "object") {
            if (seen.has(obj)) {
                return `circular ref`;
            }
            seen.add(obj);
        }
        if (obj === undefined) {
            return undefined;
        }
        if (isPrimitveType(obj)) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map((e) => this.sanitize(e, dropFields, seen));
        }
        //make a copy of the object
        const copyObj = Object.assign({}, obj);
        for (const key in copyObj) {
            if (dropFields.includes(key)) {
                delete copyObj[key];
            }
            else if (isPrimitveType(obj[key]) &&
                this.fieldNames.includes(key)) {
                copyObj[key] = "***REDACTED***";
            }
            else {
                copyObj[key] = this.sanitize(obj[key], dropFields, seen);
            }
        }
        return copyObj;
    }
}
exports.Redactor = Redactor;
exports.defaultRedactor = new Redactor([
    "string_value",
    "token_value",
    "content",
]);
//# sourceMappingURL=Redactor.js.map