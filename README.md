# automemo

Automatic memoization for any function.

`automemo` offers arguably the _most efficient_ memoization approach available in JavaScript, combining a frictionless developer experience (DX) with an exceptionally small memory footprint. Its built-in argument canonicalization and GC-aware caching (via `WeakMap`/`WeakerMap`) eliminate boilerplate and prevent memory leaks, giving you both ease of use and optimal performance.

## Overview

`automemo` provides automatic memoization for functions by canonicalizing argument lists into tuple keys using `libtuple-schema` and caching results with `WeakMap` for primitive results and `WeakerMap` for object/function results. This ensures memory-safe caches that allow garbage collection of unused entries.

[![npm version](https://img.shields.io/npm/v/automemo.svg?style=for-the-badge)](https://www.npmjs.com/package/automemo) [![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/seanmorris/automemo/test.yml?style=for-the-badge&link=https%3A%2F%2Fgithub.com%2Fseanmorris%automemo)](https://github.com/seanmorris/automemo/actions/workflows/test.yml)  [![License](https://img.shields.io/npm/l/automemo?logo=apache&color=427819&style=for-the-badge)](https://github.com/seanmorris/automemo/blob/master/LICENSE)

> ### I am giving up my bed for one night.
> My Sleep Out helps youth facing homelessness find safe shelter and loving care at Covenant House. That care includes essential services like education, job training, medical care, mental health and substance use counseling, and legal aid — everything they need to build independent, sustainable futures.
>
> By supporting my Sleep Out, you are supporting the dreams of young people overcoming homelessness.
>
> <a href = "https://www.sleepout.org/participants/62915"><img width = "50%" alt="Donate to Covenant House" src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fwww.sleepout.org%2Fapi%2F1.3%2Fparticipants%2F62915%3F_%3D1760039017428&query=%24.sumDonations&prefix=%24&suffix=%20Raised&style=for-the-badge&label=Sleep%20Out%3A%20NYC&link=https%3A%2F%2Fwww.sleepout.org%2Fparticipants%2F62915"></a>
>
> Click here to help out: https://www.sleepout.org/participants/62915
>
> More info: https://www.sleepout.org/ | https://www.covenanthouse.org/ | https://www.charitynavigator.org/ein/132725416
>
> Together, we are working towards a future where every young person has a safe place to sleep.
>
> Thank you.
>
> and now back to your documentation...

## Installation

```bash
npm install automemo
```

## Usage

```js
import { automemo } from "automemo";

// A simple example function
let computationCount = 0;
const slowFunction = (x, y) => {
  computationCount++;
  // expensive computation
  return x + y;
};

// Wrap with automemo
const memoized = automemo(slowFunction);

// First call with arguments (1,2), actual compute
console.log(memoized(1, 2)); // 3

// Second call with (1,2) uses cache
console.log(memoized(1, 2)); // 3
console.log(computationCount); // 1
```

You can customize the argument schema:

```js
import { automemo } from "automemo";
import { Schema } from "libtuple-schema";

const argSchema = Schema.sTuple(
  Schema.number(),
  Schema.xRecord({ flag: Schema.boolean() })
);
const memoizedWithSchema = automemo(
  (num, opts) => /* expensive computation */,
  argSchema
);
```

### Schema-based Key Customization

By default, `automemo` uses `Schema.nTuple(Schema.value())` to key on raw argument values (for objects, by reference). Mutating properties of the same object will _not_ change the cache key:

```js
import { automemo } from "automemo";

let runCount = 0;
const compute = ({ id, timestamp }) => {
  runCount++;
  return id;
};

const state = { id: 42, timestamp: 1000 };
const memoDefault = automemo(compute);

memoDefault(state);         // runCount -> 1
state.timestamp = 2000;
memoDefault(state);         // runCount still 1 (same object reference)
```

To key on specific properties (e.g. include `timestamp` in the cache key), supply a custom schema that precisely selects and serializes fields:

```js
import { automemo } from "automemo";
import { Schema } from "libtuple-schema";

let runCount = 0;
const compute = ({ id, timestamp }) => {
  runCount++;
  return id;
};

const state = { id: 42, timestamp: 1000 };
const tsSchema = Schema.sTuple(
  Schema.xRecord({
    id:        Schema.number(),
    timestamp: Schema.number(),
  })
);
const memoWithTs = automemo(compute, tsSchema);

memoWithTs(state);          // runCount -> 1
state.timestamp = 3000;
memoWithTs(state);          // runCount -> 2 (timestamp changed)
```

### Cache Keys Schemas

#### Schema.xTuple()

Use this as the top-level schema for functions that have a fixed number of parameters.

Each argument provided will be used as the schema for arg in the corresponding position the final tuple representing the args.

#### Schema.nTuple()

Use this as the top-level schema for functions that have a variable number of parameters that ALL share the same schema.

The argument provided will be used as the schema for EACH arg in the final tuple representing the args.

#### Schema.tuple()

Use this as the top-level schema for functions that have a few fixed parameters, followed by a variable number of parameters.

The variable parameters will simply be passed through the tuple. This will be fixed when libtuple-schema has improved support for variadic functions.

#### Schema.value()

Returns the provided value as-is. Use as the second-level schema for your args if you don't need to do any validation.

#### Further Reading

Schemas can become quite complex, and go beyond the scope of this document. For more information on writing schemas, see [libtuple-schema](https://www.npmjs.com/package/libtuple-schema).

## API

### automemo(func, [argSchema])

- **func**: The function to memoize.
- **argSchema**: An optional `SchemaMapper` from `libtuple-schema` to canonicalize argument lists into tuple keys. Defaults to `Schema.nTuple(Schema.value())`.

Returns a memoized version of `func`.

## Dependencies

- [libtuple-schema](https://npmjs.com/package/libtuple-schema): Canonicalizes arguments into tuple keys.
- [weakermap](https://npmjs.com/package/weakermap): Provides `WeakerMap` for caching object/function results with GC-awareness.
- [libtuple](https://npmjs.com/package/libtuple): Underlying tuple implementation used by `libtuple-schema`.

## Testing

Run the built-in test suite:

```bash
npm test
```

## License

Apache-2.0 © Sean Morris
