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
						<Route exact path="/:boardName" component={Board} />
						<Route path="/:boardName/:articleName" component={Article} />
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
				"電影", "教科書解答", "Lisp", "大露營", "以太坊", "筆電", "經濟學",
				"詩", "料理", "戀愛", "科幻", "書評", "求職", "代數", "創作"
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
							<Link to={"/" + board}>{board}</Link>
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
		this.state = {
			// TODO: 改成 AJAX 請求 boards
			articles: [
				"獵人真人版也該出來了吧？",
				"大家有在玩 bonbon 嗎？",
				"楊威利，不敗的魔術師",
				"母豬母豬，夜裡哭哭！",
				"何謂民主主義呢？",
				"有英雄志的八卦嗎？",
				"醫學系為何還是第一志願?",
				"台灣第一名的小吃是啥",
				"二戰時納粹打蘇聯是對的嗎？"
			]
		};
	}
	render() {
		const match = this.props.match;
		const location = this.props.location;
		return (
			<div>
				<Link to="/">回看板列表</Link>
				<h5 className="title is-5">{`歡迎來到「${match.params.boardName}」板！！`}</h5>
				{this.state.articles.map((article) => {
					return (
						<div key={article}>
							<Link to={location.pathname + "/" + article}>{article}</Link>
						</div>
					);
				})}
			</div>
		);
	}
}

class Article extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		const match = this.props.match;
		return (
			<div>
				<Link to={"/" + match.params.boardName}>回{match.params.boardName}板</Link>
				<h5 className="title is-5">{match.params.articleName}</h5>
			</div>
		);
	}
}

ReactDOM.render(
	<App />,
	document.getElementById("root")
);
