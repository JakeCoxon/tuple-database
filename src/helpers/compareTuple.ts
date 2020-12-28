import { MAX, MIN, Tuple, Value } from "../storage/types"
import { compare } from "./compare"

// MIN < null < object < array < number < string < boolean < MAX
const typeRank = [
	"min",
	"null",
	"object",
	"array",
	"number",
	"string",
	"boolean",
	"max",
]

function typeOf(value: Value) {
	if (value === MAX) {
		return "max"
	}
	if (value === MIN) {
		return "min"
	}
	if (value === null) {
		return "null"
	}
	if (Array.isArray(value)) {
		return "array"
	}
	return typeof value
}

export function compareValue(a: Value, b: Value): number {
	// Check the bounds.
	if (a === MIN) {
		if (b === MIN) {
			return 0
		} else {
			return -1
		}
	} else if (b === MIN) {
		return 1
	} else if (a === MAX) {
		if (b === MAX) {
			return 0
		} else {
			return 1
		}
	} else if (b === MAX) {
		return -1
	}

	// Null is last.
	if (a === null) {
		if (b === null) {
			return 0
		} else {
			return -1
		}
	} else {
		if (b === null) {
			return 1
		}
	}

	const at = typeOf(a)
	const bt = typeOf(b)
	if (at === bt) {
		if (at === "array") {
			return compareTuple(a as any, b as any)
		} else if (at === "object") {
			return compareObject(a as any, b as any)
		} else {
			return compare(a, b)
		}
	}

	return compare(typeRank.indexOf(at), typeRank.indexOf(bt))
}

function compareObject(
	a: { [key: string]: Value },
	b: { [key: string]: Value }
) {
	const ae = Object.entries(a).sort(([k1], [k2]) => compare(k1, k2))
	const be = Object.entries(b).sort(([k1], [k2]) => compare(k1, k2))

	const len = Math.min(ae.length, be.length)

	for (let i = 0; i < len; i++) {
		const [ak, av] = ae[i]
		const [bk, bv] = be[i]
		const dir = compareValue(ak, bk)
		if (dir === 0) {
			const dir2 = compareValue(av, bv)
			if (dir2 === 0) {
				continue
			}
			return dir2
		}
		return dir
	}

	if (ae.length > be.length) {
		return 1
	} else if (ae.length < be.length) {
		return -1
	} else {
		return 0
	}
}

export function compareTuple(a: Tuple, b: Tuple) {
	const len = Math.min(a.length, b.length)

	for (let i = 0; i < len; i++) {
		const dir = compareValue(a[i], b[i])
		if (dir === 0) {
			continue
		}
		return dir
	}

	if (a.length > b.length) {
		return 1
	} else if (a.length < b.length) {
		return -1
	} else {
		return 0
	}
}

export function ValueToString(value: Value) {
	if (value === MIN) {
		return "MIN"
	} else if (value === MAX) {
		return "MAX"
	} else if (value === null) {
		return "null"
	} else {
		return JSON.stringify(value)
	}
}

export function TupleToString(tuple: Tuple) {
	return `[${tuple.map(ValueToString).join(",")}]`
}
