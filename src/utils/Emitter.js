/**
 * @file  Emitter.js
 * @author luwenlong
 */

export default class Emitter {

    constructor() {
        this._events = {};
    }

    /**
     * 将Emitter混入目标对象
     *
     * @public
     * @param {Object} obj 目标对象
     * @return {Object} 混入Emitter对象后的目标对象
     */
    static mixin(obj) {
        obj._events = {};
        obj.on = Emitter.prototype.on;
        obj.un = Emitter.prototype.un;
        obj.once = Emitter.prototype.once;
        obj.emit = Emitter.prototype.emit;

        obj.listeners = Emitter.prototype.listeners;
        obj._getMaxListeners = Emitter.prototype._getMaxListeners;
        obj.setMaxListeners = Emitter.prototype.setMaxListeners;

        return obj;
    }

    /**
     * 获取监听器最大个数
     * 若没有设置 则设置为10
     *
     * @private
     * @return {number}
     */
    _getMaxListeners() {
        if (isNaN(this.maxListeners)) {
            this.maxListeners = 10;
        }

        return this.maxListeners;
    }

    /**
     * 挂载事件
     *
     * @public
     * @param {string} type 事件类型
     * @param {Function} listener 监听器
     * @return {Emitter}
     */
    on(type, listener) {
        var maxListeners = this._getMaxListeners();

        this._events[type] = this._events[type] || [];
        var curListeners = this._events[type].length;
        if (curListeners > maxListeners && curListeners !== 0) {
            throw new RangeError(
                'Warning: possible Emitter memory leak detected. '
                + curListeners
                + ' listeners added.'
            );
        }

        this._events[type].push(listener);

        return this;
    }

    /**
     * 挂载只执行一次的事件
     *
     * @public
     * @param {string} type 事件类型
     * @param {Function} listener 监听器
     * @return {Emitter}
     */
    once(type, listener) {
        var me = this;

        function on() {
            me.un(type, on);
            listener.apply(this, arguments);
        }

        on.listener = listener;

        this.on(type, on);

        return this;
    }

    /**
     * 注销事件及监听器
     *
     * @public
     * @param {string} type 事件类型
     * @param {Function} listener 监听器
     * @return {Emitter}
     */
    un(type, listener) {

        // 移除所有事件
        if (arguments.length === 0) {
            this._events = {};
            return this;
        }

        var listeners = this._events[type];
        if (!listeners) {
            return this;
        }

        // 移除指定事件的所有监听器
        if (arguments.length === 1) {
            delete this._events[type];
            return this;
        }

        // 移除指定事件的指定监听器
        var cb;
        for (var i = 0, len = listeners.length; i < len; i++) {
            cb = listeners[i];
            if (cb === listener || cb.listener === listener) {
                listeners.splice(i, 1);
                break;
            }
        }

        return this;
    }

    /**
     * 触发挂载的事件
     *
     * @public
     * @param {string} type 触发的事件类型
     *
     */
    emit(type) {

        var listeners = this._events[type];
        var allPool = this._events['*'];

        if (type !== '*' && allPool) {
            listeners = listeners.concat(allPool);
        }

        var args = Array.prototype.slice.call(arguments, 1);

        if (listeners) {
            listeners = listeners.slice(0);
            for (var i = 0, len = listeners.length; i < len; i++) {
                listeners[i].apply(this, args);
            }
        }

        return this;
    }

    /**
     * 返回指定事件的监听器列表
     *
     * @public
     * @param {string} type 事件类型
     * @return {Array}
     */
    listeners(type) {
        return this._events[type] || [];
    }

    /**
     * 设置监听器的最大个数
     *
     * @public
     * @param {number} number 监听器个数
     * @return {Emitter}
     */
    setMaxListeners(number) {
        this.maxListeners = number;

        return this;
    }
}
