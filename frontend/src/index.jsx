import React from "react";
import ReactDOM from "react-dom";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
} from "react-router-dom";
import Article from "./article.jsx";
import { Login, SignUp } from "./user.jsx";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			login: false,
			id: ""
		};
		this.changeLoginState = this.changeLoginState.bind(this);
		this.logout = this.logout.bind(this);
	}
	logout() {
		fetch("/api/user/logout", {
			credentials: "same-origin"
		}).then((res) => {
			if (res.ok) {
				res.text().then((data) => {
					switch (data) {
						case "OK":
							this.changeLoginState(false, "");
							break;
						case "尚未登入":
							console.log("尚未登入");
							break;
					}
				});
			} else {
				console.log("登出失敗");
			}
		}, (err) => {
			console.log(`登出失敗：${err}`);
		});
	}
	changeLoginState(login, id) {
		this.setState({
			login, id
		});
	}
	componentDidMount() {
		fetch("/api/user/who", {
			credentials: "same-origin"
		}).then((res) => {
			if (res.ok) {
				res.json().then((data) => {
					console.log(data);
					this.setState(data);
				});
			} else {
				console.log("取得 id 失敗");
			}
		}, (err) => {
			console.log(`取得 id 失敗：${err}`);
		});
	}
	render() {
		return (
			<Router>
				<div>
					<div style={{
						borderBottomStyle: "solid",
						borderBottomWidth: "1px",
						borderBottomColor: "#BFBFBF"
					}}>
						<div className="container" style={{ width: "60%" }}>
							<nav className="navbar">
								<div className="navbar-brand">
									<Link to="/" className="navbar-item">
										<h3 className="title is-3">無限城</h3>
									</Link>
									<Link to="/" className="navbar-item">
										首頁
									</Link>
								</div>
								<div className="navbar-menu">
									<div className="navbar-end">
										{
											(() => {
												if (this.state.login) {
													return [
														<a key="id" className="navbar-item">
															{this.state.id}
														</a>,
														<a key="logout" onClick={this.logout} className="navbar-item">登出</a>
													];
												} else {
													return [
														<Link key="login" to="/app/login" className="navbar-item">登入</Link>,
														<Link key="signUp" to="/app/signUp" className="navbar-item">註冊</Link>
													];
												}
											})()
										}
									</div>
								</div>
							</nav>
						</div>
					</div>
					<div className="container" style={{marginTop: "65px", width: "420px"}}>
						<Switch>
							<Route exact path="/" render={(props) => (
								<Board appState={this.state} {...props} />
							)} />
							<Route exact path="/app/" render={(props) => (
								<Board appState={this.state} {...props} />
							)} />
							<Route exact path="/app/login" render={(props) => (
								<Login appState={this.state} changeLoginState={this.changeLoginState} {...props} />
							)} />
							<Route exact path="/app/signUp" render={(props) => (
								<SignUp appState={this.state} changeLoginState={this.changeLoginState} {...props} />
							)} />
							<Route exact path="/app/b/:boardName" render={(props) => (
								<Board appState={this.state} {...props} />
							)} />
							<Route path="/app/b/:boardName/a/:articleName" render={(props) => (
								<Article appState={this.state} {...props} />
							)} />
						</Switch>
					</div>
				</div>
			</Router>
		);
	}
}

class Board extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showSource: false,
			creatingAritcle: false,
			boards: [],
			articles: [],
			showBoard: false,
			showArticle: false,
		};
	}
	componentDidMount() {
		this.getBoardsAndArticles();
	}
	getBoardsAndArticles() {
		// TODO: AJAX
		this.setState({
			boards: [
				"八卦", "棒球", "滑板", "軟體技術", "直譯器少女", "bonbon",
				"高雄", "清大", "JavaScript", "翻譯", "軍旅", "省錢", "腳踏車",
				"電影", "教科書解答", "Lisp", "大露營", "以太坊", "筆電", "經濟學",
				"詩", "料理", "戀愛", "科幻", "書評", "求職", "代數", "創作"
			],
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
					<a className={this.state.creatingAritcle ? "button is-primary" : "button"}
						style={{ marginBottom: "15px", marginRight: "12px" }}
						onClick={() => {this.setState({creatingAritcle: !this.state.creatingAritcle});}}>
						發文
					</a>
					<a className="button"
						style={{ marginBottom: "15px", marginRight: "12px" }}
						onClick={this.createBoard}>
						創建新板
					</a>
					<a className={this.state.showSource ? "button is-primary" : "button"}
						style={{ marginBottom: "15px" }}
						onClick={() => {this.setState({showSource: !this.state.showSource});}}>
						觀看看板源碼
					</a>
				</div>
				<div style={{marginBottom: "30px"}}>
					{
						(() => {
							if (this.state.showSource) {
								return <p>源碼</p>;
							}
						})()
					}
				</div>
				<div style={{marginBottom: "30px"}}>
					{
						(() => {
							if (this.state.creatingAritcle) {
								return <textarea className="textarea" placeholder="文章內容..." />;
							}
						})()
					}
				</div>
				<div style={{marginBottom: "30px"}}>
					<h5 className="title is-5">
						<span>看板 </span>
						<a onClick={() => {this.setState({showBoard: !this.state.showBoard});}}>
							{this.state.showBoard ? "收起" : "展開"}
						</a>
					</h5>
					{
						(() => {
							if (this.state.showBoard) {
								return this.state.boards.map((board) => {
									return (
										<div key={board}>
											<Link to={"/app/b/" + board}>{board}</Link>
										</div>
									);
								});
							} else {
								return;
							}
						})()
					}
				</div>
				<div style={{marginBottom: "30px"}}>
					<h5 className="title is-5">
						<span>文章 </span>
						<a onClick={() => {this.setState({showArticle: !this.state.showArticle});}}>
							{this.state.showArticle ? "收起" : "展開"}
						</a>
					</h5>
					{
						(() => {
							if (this.state.showArticle) {
								return this.state.articles.map((article) => {
									return (
										<div key={article}>
											<Link to={location.pathname + "/a/" + article}>{article}</Link>
										</div>
									);
								});
							} else {
								return;
							}
						})()
					}
				</div>
			</div>
		);
	}
}

ReactDOM.render(
	<App />,
	document.getElementById("root")
);
