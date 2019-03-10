import React from "react";

// 僅將 '\n' 轉換爲 <br />
function newLineToBr(str) {
	return str.split("\n").map((p, index) => {
		if (p == "") { return <br key={index} />; }
		else { return <span key={index}>{p}<br /></span>; }
	});
}

export {
	newLineToBr
};