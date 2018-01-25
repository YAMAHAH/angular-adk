export namespace Events {
    const _channels: any[] = [];

    /**
     * Subscribe to an event topic. Events that get posted to that topic will trigger the provided handler.
     *
     * @param {string} topic the topic to subscribe to
     * @param {function} handler the event handler
     */
    export function subscribe(topic: string, ...handlers: Function[]) {
        if (!_channels[topic]) {
            _channels[topic] = [];
        }
        handlers.forEach((handler) => {
            _channels[topic].push(handler);
        });
    }

    /**
     * Unsubscribe from the given topic. Your handler will no longer receive events published to this topic.
     *
     * @param {string} topic the topic to unsubscribe from
     * @param {function} handler the event handler
     *
     * @return true if a handler was removed
     */
    export function unsubscribe(topic: string, handler: Function = null) {
        let t = _channels[topic];
        if (!t) {
            // Wasn't found, wasn't removed
            return false;
        }

        if (!handler) {
            // Remove all handlers for this topic
            delete _channels[topic];
            return true;
        }

        // We need to find and remove a specific handler
        let i = t.indexOf(handler);

        if (i < 0) {
            // Wasn't found, wasn't removed
            return false;
        }

        t.splice(i, 1);

        // If the channel is empty now, remove it from the channel map
        if (!t.length) {
            delete _channels[topic];
        }

        return true;
    }

    /**
     * Publish an event to the given topic.
     *
     * @param {string} topic the topic to publish to
     * @param {any} eventData the data to send as the event
     */
    export function publish(topic: string, ...args: any[]) {
        var t = _channels[topic];
        if (!t) {
            return null;
        }

        let responses: any[] = [];
        t.forEach((handler: any) => {
            responses.push(handler(...args));
        });
        return responses;
    }

    const store = {};
    let setListener: Function;

    export function attach(event: string, callback: Function) {
        if (!store[event]) {
            store[event] = [];
        }
        store[event].push(callback);
    }

    export function fire(event: string, args = []) {
        if (store[event]) {
            store[event].forEach((callback) => {
                callback(...args);
            });
        }
    }

    export function remove(event: string, callback?: Function) {
        if (!callback) {
            delete store[event];
        }
        if (store[event]) {
            store[event] = store[event].filter((savedCallback) => {
                return callback !== savedCallback;
            });
        }
    }

    export function dom(element: any, event: string, callback: Function) {
        if (!setListener) {
            if (element.addEventListener) {
                setListener = function (el, ev, fn) {
                    return el.addEventListener(ev, fn, false);
                };
            } else if (typeof element["attachEvent"] === "function") {
                setListener = function (el, ev, fn) {
                    return el.attachEvent("on" + ev, fn, false);
                };
            } else {
                setListener = function (el, ev, fn) {
                    return el["on" + ev] = fn;
                };
            }
        }
        return setListener(element, event, callback);
    }
}

export default Events;