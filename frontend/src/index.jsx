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
									<Link to="/app" className="navbar-item">
										<h3 className="title is-3">無限城</h3>
									</Link>
									<Link to="/app" className="navbar-item">
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
							<Route exact path="/app/login" render={(props) => (
								<Login appState={this.state} changeLoginState={this.changeLoginState} {...props} />
							)} />
							<Route exact path="/app/signUp" render={(props) => (
								<SignUp appState={this.state} changeLoginState={this.changeLoginState} {...props} />
							)} />
							<Route exact path="/app(/b/[^/]+)*" render={(props) => (
								<Board appState={this.state} {...props} />
							)} />
							<Route path="/app(/b/[^/]+)*/a/:articleName" render={(props) => (
								<Article appState={this.state} {...props} />
							)} />
						</Switch>
					</div>
				</div>
			</Router>
		);
	}
}

class CreateArticle extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="field">
				<label className="label">文章標題</label>
				<div className="control">
					<input className="input" type="text" placeholder="看板名稱" />
				</div>
				<label className="label">文章內容</label>
				<div className="control">
					<textarea className="textarea" placeholder="文章內容" />
				</div>
			</div>
		);
	}
}

class CreateBoard extends React.Component {
	constructor(props) {
		super(props);
		this.CanDefine = [
			{ display: "可定義標題", name: "canDefTitle" },
			{ display: "可定義文章內容", name: "canDefContent" },
			{ display: "可定義文章表單", name: "canDefArticleForm" },
			{ display: "可定義留言", name: "canDefComment" },
			{ display: "可定義留言表單", name: "canDefCommentForm" },
		];
		this.RenderFunction = [
			{ display: "標題渲染函式", name: "renderTitle" },
			{ display: "文章內容渲染函式", name: "renderContent" },
			{ display: "發文表單渲染函式", name: "renderArti key={urlPath}cleForm" },
			{ display: "留言渲染函式", name: "renderComment" },
			{ display: "留言表單渲染函式", name: "renderCommentForm" },
		];
		this.state = {
			rules: {}
		};
		this.CanDefine.forEach((option) => {
			this.state.rules[[option.name]] = true;
		});
		this.RenderFunction.forEach((option) => {
			this.state.rules[[option.name]] = null;
		});
		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleNameChange = this.handleNameChange.bind(this);
		this.handleOnSubmit = this.handleOnSubmit.bind(this);
	}
	handleInputChange(event) {
		const target = event.target;
		const value = target.type === "checkbox" ? target.checked : target.value;
		const name = target.name;

		this.setState({
			rules: {
				[name]: value
			}
		});
	}
	handleNameChange(event) {
		this.setState({
			name: event.target.value
		});
	}
	handleOnSubmit() {
		let { name, rules } = this.state;
		this.props.newBoard({ name, rules });
	}
	render() {
		return (
			<div>
				<div className="field">
					<label className="label">看板名稱</label>
					<div className="control">
						<input onChange={this.handleNameChange} className="input" type="text" placeholder="看板名稱" />
					</div>
				</div>
				{
					(() => {
						return (
							this.CanDefine.map((option) => {
								return (
									<div key={option.name} className="field">
										<label className="checkbox">
											<input onChange={this.handleInputChange} defaultChecked={this.state.rules[[option.name]]} name={option.name} type="checkbox" />
											{option.display}
										</label>
									</div>

								);
							}

							)
						);
					})()
				}
				{
					(() => {
						return (
							this.RenderFunction.map((option) => {
								return (
									<div key={option.name} className="field">
										<label className="label">{option.display}</label>
										<div className="control">
											<textarea onChange={this.handleInputChange} className="textarea" placeholder={option.display} />
										</div>
									</div>
								);
							})
						);
					})()
				}
				<div className="field">
					<div className="control">
						<button onClick={this.handleOnSubmit} className="button is-primary">送出</button>
					</div>
				</div>
			</div>
		);
	}
}

class Board extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showSource: false,
			creatingAritcle: false,
			creatingBoard: false,
			boards: [],
			articles: [],
			showBoard: false,
			showArticle: false,
		};
		this.newBoard = this.newBoard.bind(this);
	}
	countPath() {
		const urlPath = this.props.location.pathname;
		const path = urlPath.split("/").slice(2).filter((ele, index) => index % 2 == 1);
		return path;
	}
	componentDidMount() {
		this.getBoardData();
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevProps.location.pathname != this.props.location.pathname) {
			this.getBoardData();
		}
	}
	getBoardData() {
		const path = this.countPath();
		const url = (path.length == 0) ? "/api/board/browse" : `/api/board/browse?name=${path.join(",")}`;
		fetch(url, {
			credentials: "same-origin"
		}).then((res) => {
			if (res.ok) {
				res.json().then((data) => {
					switch (data) {
						case "FAIL":
							console.log("取得看板資料失敗");
							break;
						default:
							console.log(data);
							this.boardID = data.board_id;
							const boards = data.b_list.map(b => b.name);
							const articles = data.a_list.map(a => a.name);
							this.setState({
								boards: boards,
								articles: articles
							});
					}
				});
			} else {
				console.log("取得看板資料：非正常失敗");
			}
		}, (err) => {
			console.log("AJAX失敗，取得看板資料失敗");
		});
	}
	newBoard(boardDefinition) {
		fetch("/api/board/new", {
			method: "POST",
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				parent: this.boardID,
				name: boardDefinition.name,
				rules: boardDefinition.rules,
			})
		}).then((res) => {
			if (res.ok) {
				res.text().then((data) => {
					switch (data) {
						case "FAIL":
							console.log("創建看板失敗");
							break;
						case "OK":
							console.log("創建看板成功");
							break;
						case "尚未登入":
							console.log("尚未登入");
							break;
					}
				});
			} else {
				console.log("創建看板：非正常失敗");
			}
		}, (err) => {
			console.log("AJAX失敗，創建看板失敗");
		});
	}
	render() {
		const location = this.props.location;
		return (
			<div>
				<div style={{fontSize: "24px", marginBottom: "30px"}}>
					當前看板：
					{
						(() => {
							let urlPath = "/app";
							let result = [
								<Link key={urlPath} to={urlPath}><span>根</span></Link>
							];
							for (let boardName of this.countPath()) {
								urlPath += `/b/${boardName}`;
								result.push(<span key={urlPath + "/"}> / </span>);
								result.push(<Link key={urlPath} to={urlPath}><span>{boardName}</span></Link>);
							}
							return result;
						})()
					}
				</div>
				<div style={{ marginBottom: "30px" }}>
					<a className={this.state.creatingAritcle ? "button is-success" : "button"}
						style={{ marginBottom: "15px", marginRight: "12px" }}
						onClick={() => {this.setState({creatingAritcle: !this.state.creatingAritcle});}}>
						發文
					</a>
					<a className={this.state.creatingBoard ? "button is-success" : "button"}
						style={{ marginBottom: "15px", marginRight: "12px" }}
						onClick={() => {this.setState({creatingBoard: !this.state.creatingBoard});}}>
						創建新板
					</a>
					<a className={this.state.showSource ? "button is-success" : "button"}
						style={{ marginBottom: "15px" }}
						onClick={() => {this.setState({showSource: !this.state.showSource});}}>
						觀看看板源碼
					</a>
				</div>
				{
					(() => {
						if (this.state.creatingAritcle) {
							return (
								<div className="box" style={{ marginBottom: "30px" }}>
									<h4 className="title is-4">發文</h4>
									<CreateArticle />
								</div>
							);
						}
					})()
				}
				{
					(() => {
						if (this.state.creatingBoard) {
							return (
								<div className="box" style={{ marginBottom: "30px" }}>
									<h4 className="title is-4">創建新版</h4>
									<CreateBoard newBoard={this.newBoard} />
								</div>
							);
						}
					})()
				}
				{
					(() => {
						if (this.state.showSource) {
							return (
								<div style={{ marginBottom: "30px" }}>
									<p>源碼</p>
								</div>
							);
						}
					})()
				}
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
										<div key={board} key={board}>
											<Link to={location.pathname + "/b/" + board}>{board}</Link>
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
