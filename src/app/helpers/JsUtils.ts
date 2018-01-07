export class JsUtils {
    static throttle(func: Function, interval) {
        let doing = false;
        return function () {
            if (doing) {
                return;
            }
            doing = true;
            func.apply(this, arguments);
            setTimeout(function () {
                doing = false;
            }, interval);
        }
    }

    static debounce(func: Function, interval) {
        let timer = null;
        function delay() {
            let target = this;
            let args = arguments;
            return setTimeout(function () {
                func.apply(target, args);
            }, interval);
        }
        return function () {
            if (timer) {
                clearTimeout(timer);
            }
            timer = delay.apply(this, arguments);
        }
    }

    static isType(type) {
        return function (obj) {
            return Object.prototype.toString.call(obj) === "[object " + type + "]";
        }
    }
    static currying(func: Function) {
        let args = [];
        return function () {
            if (arguments.length === 0) {
                return func.apply(this, args);
            } else {
                Array.prototype.push.apply(args, arguments);
                return arguments.callee;
            }
        }
    }
}