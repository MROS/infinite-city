export function FormArrayToObject(arr, reserveEvalType=false) {
	let obj = {};
	for (let item of arr) {
		obj[item.label] = arr.body;
	}
	return obj;
}

export function FormObjectToArray(obj) {
	return Object.keys(obj).map((label) => {
		return { body: obj[label], label: label };
	});
}
