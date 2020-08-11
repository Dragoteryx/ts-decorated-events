import { EventEmitter as NodeEventEmitter } from "events";

// types

export interface Events extends Record<string | symbol, any[]> {}
export type InferEvents<T> = T extends EventEmitter<infer R> ? R : never;

export interface EventDecorated<E extends Events, K extends keyof E> {
  <T extends EventEmitter<E>>(
    target: T, key: string | symbol,
    descriptor: TypedPropertyDescriptor<(this: T, ...args: E[K]) => any>
  ): void;
  <T extends EventEmitter<E>, C extends Function & {prototype: T}>(
    target: C, key: string | symbol,
    descriptor: TypedPropertyDescriptor<(this: C, emitter: T, ...args: E[K]) => any>
  ): void;
}
export interface EventDecorator<E extends Events = Events> {
  <K extends keyof E & (string | symbol)>(event: K): EventDecorated<E, K>;
}
export namespace EventDecorator {
  export const symbol = Symbol("EventDecorator");
}

// decorators

function decorate(type: "on" | "once") {
  return ((event: string) => {
    return (target: typeof EventEmitter | EventEmitter, key: keyof typeof target) => {
      const prototype = "prototype" in target ? target.prototype : target;
      const old_decorate = prototype[EventDecorator.symbol];
      prototype[EventDecorator.symbol] = function() {
        if (typeof old_decorate == "function") old_decorate.call(this);
        this[type](event, (...args: any[]) => {
          // @ts-expect-error
          target == prototype ? target[key].call(this, ...args) : target[key].call(target, this, ...args);
        });
      }
    };
  }) as EventDecorator;
}

export const on = decorate("on");
export const once = decorate("once");

// main class

export class EventEmitter<E extends Events> extends NodeEventEmitter {
  private [EventDecorator.symbol]() {}
  public constructor(...args: ConstructorParameters<typeof NodeEventEmitter>) {
    super(...args);
    this[EventDecorator.symbol]();
  }
}
Object.defineProperty(EventEmitter.prototype, EventDecorator.symbol, {configurable: false, enumerable: false});

type Listener<T extends any[]> = (...args: T) => any;
export interface EventEmitter<E extends Events = Events> extends NodeEventEmitter {
  emit<K extends keyof E & (string | symbol)>(event: K, ...args: E[K]): boolean;
  on<K extends keyof E & (string | symbol)>(event: K, listener: Listener<E[K]>): this;
  once<K extends keyof E & (string | symbol)>(event: K, listener: Listener<E[K]>): this;
  off<K extends keyof E & (string | symbol)>(event: K, listener: Listener<E[K]>): this;

  addListener<K extends keyof E & (string | symbol)>(event: K, listener: Listener<E[K]>): this;
  removeListener<K extends keyof E & (string | symbol)>(event: K, listener: Listener<E[K]>): this;
  removeAllListeners<K extends keyof E & (string | symbol)>(event?: K): this;

  listeners<K extends keyof E & (string | symbol)>(event: K): Listener<E[K]>[];
  listenerCount<K extends keyof E & (string | symbol)>(event: K): number;

  prependListener<K extends keyof E & (string | symbol)>(event: K, listener: Listener<E[K]>): this;
  prependOnceListener<K extends keyof E & (string | symbol)>(event: K, listener: Listener<E[K]>): this;

  eventNames<K extends keyof E & (string | symbol)>(): K[];
  rawListeners<K extends keyof E & (string | symbol)>(event: K): Listener<E[K]>[];
}