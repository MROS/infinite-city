import React from "react";

function SourceCode(props) {
	const html = props.code;
	// 由於 className 皆與 bulma 衝突，故現在僅嵌入純字串，不含 html 標籤
	// 但爲兼容未來，暫時保留此一寫法
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
							<div>標籤：{item.label}</div>
							<div>型別：<span className="tag is-info">{item.evalType}</span></div>
							<SourceCode code={item.restrict} />
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
		<div style={{marginBottom: "12px"}}>
			<h5 className="title is-5" style={{marginBottom: "3px"}}>{name}</h5>
			{
				funcs.length > 0 ?
					funcs.map((code, index) => {
						return <SourceCode key={index} code={code} language="javascript" />;
					}) :
					<div>無限制</div>
			}
		</div>
	);
}

export {
	SourceCode,
	ShowOnSeries,
	ShowFormSeries,
};