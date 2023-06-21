export declare enum TimeUnits {
    milliseconds = 0,
    seconds = 1,
    minutes = 2,
    hours = 3
}
export default class Time {
    value: number;
    units: TimeUnits;
    constructor(value: number, units: TimeUnits);
    toMillSeconds(): Time;
    add(other: Time): Time;
    sub(other: Time): Time;
    multiply(other: number): Time;
    gt(other: Time): boolean;
}
//# sourceMappingURL=Time.d.ts.map