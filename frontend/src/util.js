function LabelArrayToObject(arr, func) {
	let obj = {};
	for (let item of arr) {
		obj[item.label] = func(item);
	}
	return obj;
}

function LabelObjectToArray(obj, form) {
	return form.map((item) => {
		return { body: obj[item.label], label: item.label };
	});
}

function pick(keyArray, obj) {
	let ret = {};
	for (let key of keyArray) {
		ret[key] = obj[key];
	}
	return ret;
}
export default {
	LabelArrayToObject,
	LabelObjectToArray,
	pick,
};