export function LabelArrayToObject(arr, func) {
	let obj = {};
	for (let item of arr) {
		obj[item.label] = func(item);
	}
	return obj;
}

export function LabelObjectToArray(obj, form) {
	return form.map((item) => {
		return { body: obj[item.label], label: item.label };
	});
}
