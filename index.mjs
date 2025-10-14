import s from "libtuple-schema";
import { WeakerMap } from "weakermap";
const memosA = new WeakMap;
const memosB = new WeakerMap;
export const automemo = (func, argSchema = s.nTuple(s.value())) => {
	return (...args) => {
		const argTuple = argSchema(args);

		if(memosA.has(argTuple))
		{
			return memosA.get(argTuple);
		}

		if(memosB.has(argTuple))
		{
			return memosB.get(argTuple);
		}

		const result = func(...args);

		if(result && (typeof result === 'object' || typeof result === 'function'))
		{
			memosB.set(argTuple, result);
		}
		else
		{
			memosA.set(argTuple, result);
		}

		return result;
	}
};
