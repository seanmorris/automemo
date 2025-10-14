import { strict as assert } from 'assert';
import { automemo }			from '../index.mjs';
import Schema						from 'libtuple-schema';

function testPrimitiveMemoization() {
	let count = 0;
	const addOne = (x) => {
	count += 1;
	return x + 1;
	};
	const memoized = automemo(addOne);

	assert.strictEqual(memoized(1), 2);
	assert.strictEqual(memoized(1), 2);
	assert.strictEqual(count, 1, 'Primitive input should compute only once');

	assert.strictEqual(memoized(2), 3);
	assert.strictEqual(count, 2, 'Different input should trigger computation');
}

function testObjectResultMemoization() {
	let count = 0;
	const makeObj = (x) => {
		count += 1;
		return { val: x };
	};
	const memoized = automemo(makeObj);

	const obj1 = memoized(5);
	const obj2 = memoized(5);
	assert.strictEqual(obj1, obj2, 'Object result should be memoized by reference');
	assert.strictEqual(count, 1, 'Underlying function should run only once for same args');
	assert.deepStrictEqual(obj1, { val: 5 });
}

function testObjectArgMemoization() {
	let count = 0;
	const identity = (obj) => {
		count += 1;
		return obj;
	};
	const memoized = automemo(identity);

	const o1 = { a: 1 };
	const r1 = memoized(o1);
	const r2 = memoized({ a: 1 });
	assert.notStrictEqual(r1, r2, 'Different object references should not collide by default');
	assert.strictEqual(count, 2);

	const jsonSchema = Schema.nTuple(Schema.value({ map: (v) => JSON.stringify(v) }));
	count = 0;
	const memoizedJson = automemo(identity, jsonSchema);
	const r3 = memoizedJson({ a: 2 });
	const r4 = memoizedJson({ a: 2 });
	assert.strictEqual(r3, r4, 'Custom schema key generation should allow mapping object-shaped args');
	assert.strictEqual(count, 1);
}

function testMultipleArgsMemoization() {
	let count = 0;
	const sum = (a, b) => {
		count += 1;
		return a + b;
	};
	const memoized = automemo(sum);

	assert.strictEqual(memoized(1, 2), 3);
	assert.strictEqual(memoized(1, 2), 3);
	assert.strictEqual(memoized(2, 1), 3);
	assert.strictEqual(count, 2, 'Different argument tuples should compute separately');
}

function testSchemaValidation() {
	let ran = false;
	const fn = () => { ran = true; };
	const strictSchema = Schema.sTuple(Schema.number());
	const memoized = automemo(fn, strictSchema);
	assert.throws(
	() => memoized('not a number'),
	TypeError,
	'Schema violation should throw a TypeError'
	);
}

function testFunctionArgMemoization() {
	let count = 0;
	const runner = (fn) => {
		count += 1;
		return fn();
	};
	const memoized = automemo(runner);
	const inner = () => 42;

	assert.strictEqual(memoized(inner), 42);
	assert.strictEqual(memoized(inner), 42);
	assert.strictEqual(count, 1, 'Function arguments should be memoized correctly');
}

function testTimestampBasedMemoization() {
	let count = 0;
	const compute = ({ id, timestamp }) => {
		count += 1;
		return id;
	};
	const state = { id: 42, timestamp: 1000 };
	const memoDefault = automemo(compute);
	assert.strictEqual(memoDefault(state), 42);
	state.timestamp = 2000;
	assert.strictEqual(memoDefault(state), 42);
	assert.strictEqual(count, 1);

	count = 0;
	const tsSchema = Schema.nTuple(
		Schema.record({ id: Schema.number(), timestamp: Schema.number() })
	);
	const memoTs = automemo(compute, tsSchema);
	assert.strictEqual(memoTs(state), 42);
	state.timestamp = 3000;
	assert.strictEqual(memoTs(state), 42);
	assert.strictEqual(count, 2);
}

function testBasicUsage() {
	let count = 0;

	const slowFunction = (x, y) => {
		count++;
		return x + y;
	};

	const memo = automemo(slowFunction);

	assert.strictEqual(memo(1, 2), 3);
	assert.strictEqual(memo(1, 2), 3);

	assert.strictEqual(count, 1, 'Basic usage should compute once per unique args');
}

function testCustomArgSchema() {
	let count = 0;

	const fn = (num, opts) => {
		count++;
		return num + (opts.flag ? 1 : 0);
	};

	const argSchema = Schema.sTuple(
		Schema.number(),
		Schema.xRecord({ flag: Schema.boolean() })
	);

	const memo = automemo(fn, argSchema);

	// Same num & flag yields one computation even if extra props differ
	assert.strictEqual(memo(5, { flag: true, extra: 'a' }), 6);
	assert.strictEqual(memo(5, { flag: true, extra: 'b' }), 6);
	assert.strictEqual(count, 1, 'Custom schema should ignore extra object props');

	// Different flag yields new computation
	assert.strictEqual(memo(5, { flag: false }), 5);
	assert.strictEqual(count, 2, 'Changing flag should trigger recompute');
}

(async function runTests() {
	testPrimitiveMemoization();
	testObjectResultMemoization();
	testObjectArgMemoization();
	testMultipleArgsMemoization();
	testSchemaValidation();
	testFunctionArgMemoization();
	testBasicUsage();
	testCustomArgSchema();
	testTimestampBasedMemoization();
	console.log('All tests passed');
})();
