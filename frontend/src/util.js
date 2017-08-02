export function FormArrayToObject(arr, reserveEvalType=false) {
	let obj = {};
	for (let item of arr) {
		obj[item.label] = arr.body;
	}
	return obj;
}

export function FormObjectToArray(obj, form) {
	return form.map((item) => {
		return { body: obj[item.label], label: item.label };
	});
}
