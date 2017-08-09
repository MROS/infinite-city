import Prism from "prismjs";
import React from "react";

function SourceCode(props) {
	const html = Prism.highlight(props.code, Prism.languages[props.language]);
	return (
		<pre>
			<code>
				<div dangerouslySetInnerHTML={{ __html: html }}></div>
			</code>
		</pre>
	);
}

export default SourceCode;