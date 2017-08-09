import React from "react";

function SourceCode(props) {
	const html = props.code;
	return (
		<pre>
			<code>
				<div dangerouslySetInnerHTML={{ __html: html }}></div>
			</code>
		</pre>
	);
}

export default SourceCode;