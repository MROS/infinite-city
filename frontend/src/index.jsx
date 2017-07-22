import React from "react";
import ReactDOM from "react-dom";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			boards: [
				"八卦", "棒球", "滑板", "軟體技術", "直譯器少女", "bonbon",
				"高雄", "清大", "JavaScript", "翻譯", "軍旅", "省錢", "腳踏車",
				"電影", "教科書解答", "Lisp"
			]
		};
	}
	render() {
		return (
			<div className="container" style={{marginTop: "35px", width: "300px"}}>
				<h1 className="title is-1">無限城</h1>
				<h3 className="title is-4">此處不斷增生</h3>
				<a className="button" style={{marginBottom: "25px"}}>創建新板</a>
				{this.state.boards.map((board) => <div key={board}><a href={"/board/" + board}>{board}</a></div>)}
			</div>
		);
	}
}

ReactDOM.render(
	<App />,
	document.getElementById("root")
);
