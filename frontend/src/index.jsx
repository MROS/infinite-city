import React from "react";
import ReactDOM from "react-dom";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
} from "react-router-dom";
import Article from "./article.jsx";

class App extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div>
				<div style={{
					borderBottomStyle: "solid",
					borderBottomWidth: "1px",
					borderBottomColor: "#BFBFBF"
				}}>
					<div className="container" style={{ width: "60%" }}>
						<nav className="navbar">
							<div className="navbar-brand">
								<a className="navbar-item" href="/" style={{}}>
									<h3 className="title is-3">無限城</h3>
								</a>
							</div>
							<div className="navbar-menu">
								<div className="navbar-end">
									<a className="navbar-item">登錄</a>
									<a className="navbar-item">註冊</a>
								</div>
							</div>
						</nav>
					</div>
				</div>
				<div className="container" style={{marginTop: "35px", width: "420px"}}>
					<Router>
						<Switch>
							<Route exact path="/" component={BoardList} />
							<Route exact path="/app/" component={BoardList} />
							<Route exact path="/app/b/:boardName" component={Board} />
							<Route path="/app/b/:boardName/a/:articleName" component={Article} />
						</Switch>
					</Router>
				</div>
			</div>
		);
	}
}

class BoardList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			boards: []
		};
		this.createBoard = this.createBoard.bind(this);
	}
	componentDidMount() {
		this.getBoards();
	}
	getBoards() {
		// TODO: AJAX
		this.setState({
			boards: [
				"八卦", "棒球", "滑板", "軟體技術", "直譯器少女", "bonbon",
				"高雄", "清大", "JavaScript", "翻譯", "軍旅", "省錢", "腳踏車",
				"電影", "教科書解答", "Lisp", "大露營", "以太坊", "筆電", "經濟學",
				"詩", "料理", "戀愛", "科幻", "書評", "求職", "代數", "創作"
			]
		});
	}
	createBoard() {
		console.log("創建新版");
		return;
	}
	render() {
		return (
			<div>
				<a className="button"
					style={{ marginBottom: "25px" }}
					onClick={this.createBoard}>
					創建新板
				</a>
				{this.state.boards.map((board) => {
					return (
						<div key={board}>
							<Link to={"/app/b/" + board}>{board}</Link>
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
			articles: []
		};
	}
	componentDidMount() {
		this.getArticles();
	}
	getArticles() {
		// TODO: AJAX
		this.setState({
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
		});
	}
	render() {
		const match = this.props.match;
		const location = this.props.location;
		return (
			<div>
				<Link to="/">回看板列表</Link>
				<h5 className="title is-5">{`歡迎來到「${match.params.boardName}」板！！`}</h5>
				<div>
					<a className="button" style={{ marginBottom: "25px", marginRight: "12px" }}>發文</a>
					<a className="button" style={{ marginBottom: "25px" }}>觀看看板源碼</a>
				</div>
				{this.state.articles.map((article) => {
					return (
						<div key={article}>
							<Link to={location.pathname + "/a/" + article}>{article}</Link>
						</div>
					);
				})}
			</div>
		);
	}
}

ReactDOM.render(
	<App />,
	document.getElementById("root")
);
