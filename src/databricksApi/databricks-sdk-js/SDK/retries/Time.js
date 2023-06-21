"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeUnits = void 0;
var TimeUnits;
(function (TimeUnits) {
    TimeUnits[TimeUnits["milliseconds"] = 0] = "milliseconds";
    TimeUnits[TimeUnits["seconds"] = 1] = "seconds";
    TimeUnits[TimeUnits["minutes"] = 2] = "minutes";
    TimeUnits[TimeUnits["hours"] = 3] = "hours";
})(TimeUnits || (exports.TimeUnits = TimeUnits = {}));
class Time {
    constructor(value, units) {
        this.units = units;
        this.value = value;
    }
    toMillSeconds() {
        let milliSecondsValue = 0;
        switch (this.units) {
            case TimeUnits.hours:
                milliSecondsValue = this.value * 60 * 60 * 1000;
                break;
            case TimeUnits.minutes:
                milliSecondsValue = this.value * 60 * 1000;
                break;
            case TimeUnits.seconds:
                milliSecondsValue = this.value * 1000;
                break;
            case TimeUnits.milliseconds:
                milliSecondsValue = this.value;
                break;
        }
        return new Time(milliSecondsValue, TimeUnits.milliseconds);
    }
    add(other) {
        return new Time(this.toMillSeconds().value + other.toMillSeconds().value, TimeUnits.milliseconds);
    }
    sub(other) {
        return new Time(this.toMillSeconds().value - other.toMillSeconds().value, TimeUnits.milliseconds);
    }
    multiply(other) {
        return new Time(this.value * other, this.units);
    }
    gt(other) {
        return this.toMillSeconds().value > other.toMillSeconds().value;
    }
}
exports.default = Time;
//# sourceMappingURL=Time.js.map