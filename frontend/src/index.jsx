import React from "react";
import ReactDOM from "react-dom";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
} from "react-router-dom";
import example from "./example";

class App extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="container" style={{marginTop: "35px", width: "420px"}}>
				<h1 className="title is-1">無限城</h1>
				<h3 className="subtitle is-4">此處不斷增生</h3>
				<Router>
					<Switch>
						<Route exact path="/" component={BoardList} />
						<Route exact path="/app/" component={BoardList} />
						<Route exact path="/app/b/:boardName" component={Board} />
						<Route path="/app/b/:boardName/a/:articleName" component={Article} />
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
				<div><a className="button" style={{ marginBottom: "25px" }}>發文</a></div>
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
class Article extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			content: example.exampleArticle,
			comments: [
				{user: "yc0304", content: "甲"},
				{user: "lturtsamuel", content: "姆咪姆咪"},
				{user: "痛哭的人", content: "痛哭流涕"},
			]
		};
	}
	render() {
		const match = this.props.match;
		return (
			<div>
				<Link to={"/app/b/" + match.params.boardName}>
					<div style={{marginBottom: "10px"}}>
						回{match.params.boardName}板
					</div>
				</Link>
				 <h4 className="title is-4" style={{marginBottom: "8px"}}>{match.params.articleName}</h4>
				<div>
					{
						this.state.content.split("\n").map((p) => {
							if (p == "") { return <br />; }
							else { return <p>{p}</p>; }
						})
					}
				</div>
				 <div>
					<h5 className="title is-5">留言區</h5>
					<hr />
					 {
						this.state.comments.map((comment) => {
							return (
								<div>
									<span style={{ color: "blue" }}>{comment.user}</span>
									<span>：</span>
									<span>{comment.content}</span>
									<hr />
								</div>
							);
						})
					}
				</div>
				<div className="field has-addons" style={{ marginBottom: "25px" }}>
					<div className="control is-expanded">
						<input className="input" type="text" placeholder="說點什麼吧" />
					</div>
					<div className="control">
						<a className="button">我來留言</a>
					</div>
				</div>
			</div>
		);
	}
}

ReactDOM.render(
	<App />,
	document.getElementById("root")
);
