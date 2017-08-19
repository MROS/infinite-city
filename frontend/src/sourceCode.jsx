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

function ShowFormSeries(props) {
	const items = props.items;
	const name = props.name;
	return (
		<div style={{marginBottom: "15px"}}>
			<h5 className="title is-5" style={{marginBottom: "10px"}}>{name}</h5>
			{
				items.map((item) => {
					return (
						<div style={{marginLeft: "20px"}}>
							<div style={{marginBottom: "5px"}}>
								{item.label} <span className="tag is-info">{item.evalType}</span>
							</div>
							<SourceCode code={item.body} />
						</div>
					);
				})
			}
		</div>
	);
}

function ShowOnSeries(props) {
	const name = props.name;
	const funcs = props.funcs;
	return (
		<div>
			<h5 className="title is-5" style={{marginBottom: "10px"}}>{name}</h5>
			{
				funcs.map((code, index) => {
					return <SourceCode key={index} code={code} language="javascript" />;
				})
			}
		</div>
	);
}

export {
	SourceCode,
	ShowOnSeries,
	ShowFormSeries,
};