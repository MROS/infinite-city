import React from "react";
import ReactDOM from "react-dom";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
} from "react-router-dom";

class App extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="container" style={{marginTop: "35px", width: "300px"}}>
				<h1 className="title is-1">無限城</h1>
				<h3 className="subtitle is-4">此處不斷增生</h3>
				<Router>
					<Switch>
						<Route exact path="/" component={BoardList} />
						<Route path="/board/:boardName" component={Board} />
					</Switch>
				</Router>
			</div>
		);
	}
}

class BoardList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// TODO: 改成 AJAX 請求 boards
			boards: [
				"八卦", "棒球", "滑板", "軟體技術", "直譯器少女", "bonbon",
				"高雄", "清大", "JavaScript", "翻譯", "軍旅", "省錢", "腳踏車",
				"電影", "教科書解答", "Lisp"
			]
		};
	}
	render() {
		return (
			<div>
				<a className="button" style={{ marginBottom: "25px" }}>創建新板</a>
				{this.state.boards.map((board) => {
					return (
						<div key={board}>
							<Link to={"/board/" + board}>{board}</Link>
						</div>
					);
				})}
			</div>
		);
	}
}

class Board extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		const match = this.props.match;
		return (
			<h4>{`歡迎來到${match.params.boardName}板！！`}</h4>
		);
	}
}

ReactDOM.render(
	<App />,
	document.getElementById("root")
);
