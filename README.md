# ts-decorated-events
A typed version of Node.js EventEmitter with TypeScript decorators.
```ts
import { EventEmitter, Events, EventDecorator, on, once } from "ts-decorated-events";

// redefine on and once to the correct type
const testOn: EventDecorator<Test> = on;
const testOnce: EventDecorator<Test> = once;

// define the events
interface TestEvents extends Events {
  event1: [string, number];
  event2: [number, string];
}

/*
  You can define the events as a type instead of an interface to be stricter.
  Defining the types as an interface allows calling unknown events.

  type TestEvents = {
    event1: [string, number];
    event2: [number, string];
  }

*/

// decorators can be used on method and static methods
class Test extends EventEmitter<TestEvents> {

  @testOn("event1")
  public onEvent1(a: string, b: number) {
    // -- do stuff
  }

  @testOnce("event2")
  public static onEvent2(emitter: Test, a: number, b: string) {
    // -- do static stuff once
  }

}
```
