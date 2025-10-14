import { automemo } from "../index.mjs";

let i = 0;

const func = a => {
	i++;
	return a
};

const memofunc = automemo(func);

for(let i = 0; i < 10**6; i++)
{
	memofunc(321) === memofunc(321);
}

console.log(i);
