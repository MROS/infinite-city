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
														<Link key="id" to="/app/login" className="navbar-item">
															{this.state.id}
														</Link>,
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
								<BoardList appState={this.state} {...props} />
							)} />
							<Route exact path="/app/" render={(props) => (
								<BoardList appState={this.state} {...props} />
							)} />
							<Route exact path="/app/login" render={(props) => (
								<Login appState={this.state} {...props} />
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

// class idPasswordForm extends React.Component {

// }

class SignUp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			info: {
				message: "",
				status: "none"
			},
			password: "",
			id: "",
			justSignUpSuccess: false,  // 剛註冊成功時會打開此旗標，渲染出註冊成功的消息，並在五秒後跳轉回首頁
		};
		this.createUser = this.createUser.bind(this);
		this.handlePasswordChange = this.handlePasswordChange.bind(this);
		this.handleIDChange = this.handleIDChange.bind(this);
		this.deleteInfo = this.deleteInfo.bind(this);
	}
	handlePasswordChange(event) {
		this.setState({password: event.target.value});
	}
	handleIDChange(event) {
		this.setState({id: event.target.value});
	}
	deleteInfo() {
		this.setState({
			info: {
				status: "none",
				message: ""
			}
		});
	}
	createUser() {
		console.log(`使用者名稱：${this.state.id}`);
		console.log(`密碼：${this.state.password}`);
		if (this.state.id.length == 0 || this.state.password.length == 0) {
			console.log("壞囉");
			this.setState({
				info: {
					status: "error",
					message: "帳號密碼皆不得爲空",
				}
			});
			return;
		}
		fetch("/api/user/new", {
			method: "POST",
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({id: this.state.id, password: this.state.password})
		}).then((res) => {
			if (res.ok) {
				res.text().then((data) => {
					console.log(data);
					switch (data) {
						case "OK":
							this.setState({
								justSignUpSuccess: true
							});
							setTimeout(() => {
								this.props.changeLoginState(true, this.state.id);
								this.props.history.push("/");
							}, 5000);
							break;
						case "ID 已被使用":
							this.setState({
								info: {
									status: "error",
									message: `名稱 ${this.state.id} 已被使用過`,
								}
							});
						case "FAIL":
							console.log("註冊失敗：伺服器不明問題");
							break;
					}
				});
			}
		}, (err) => {
			console.log(err);
		});
	}
	render() {
		if (this.state.justSignUpSuccess) {
			return (
				<div>
					<p>恭喜！{this.state.id}</p>
					<p>您已經成功註冊，將在五秒內跳轉回首頁</p>
				</div>
			);
		}
		else if (this.props.appState.login == true) {
			return (
				<div>
					<p>您好！{this.props.appState.id}</p>
					<p>請先登出再進行註冊</p>
				</div>
			);
		} else {
			return (
				<div>
					<div className="field">
						<p className="control has-icons-left has-icons-right">
							<input
								className="input" placeholder="使用者名稱"
								value={this.state.id} onChange={this.handleIDChange} />
							<span className="icon is-small is-left">
								<i className="fa fa-user-o"></i>
							</span>
						</p>
					</div>
					<div className="field">
						<p className="control has-icons-left">
							<input
								className="input" type="password" placeholder="密碼"
								value={this.state.password} onChange={this.handlePasswordChange} />
							<span className="icon is-small is-left">
								<i className="fa fa-lock"></i>
							</span>
						</p>
					</div>
					<div className="field">
						<p className="control">
							<button className="button" onClick={this.createUser}>
								註冊
							</button>
						</p>
					</div>
					{
						(() => {
							switch (this.state.info.status) {
								case "none":
									return null;
								case "error":
									return (
										<div className="notification is-danger">
											<button className="delete" onClick={this.deleteInfo}></button>
											{this.state.info.message}
										</div>
									);
							}
						})()
					}
				</div>
			);
		}
	}
}

class Login extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return <p>登入</p>;
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
			showSource: false,
			creatingAritcle: false,
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
					<a className={this.state.creatingAritcle ? "button is-primary" : "button"}
						style={{ marginBottom: "25px", marginRight: "12px" }}
						onClick={() => {this.setState({creatingAritcle: !this.state.creatingAritcle});}}>
						發文
					</a>
					<a className={this.state.showSource ? "button is-primary" : "button"}
						style={{ marginBottom: "25px" }}
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
					{
						(() => {
							if (this.state.creatingAritcle) {
								return <input className="input" type="textarea" placeholder="文章內容..." />;
							}
						})()
					}
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
