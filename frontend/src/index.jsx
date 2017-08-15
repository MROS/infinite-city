import React from "react";
import ReactDOM from "react-dom";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
} from "react-router-dom";
import Article from "./article.jsx";
import Board from "./board.jsx";
import { Login } from "./user.jsx";
import SignUpForm from "./signupform.jsx";
import Verification from "./verification.jsx";
import NotificationSystem from "react-notification-system";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			login: false,
			id: ""
		};
		this.changeLoginState = this.changeLoginState.bind(this);
		this.logout = this.logout.bind(this);
		this.notify = this.notify.bind(this);
	}
	notify(option) {
		option.position = option.position || "tc";
		this.refs.notificationSystem.addNotification(option);
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
					console.log("取得登入資料");
					this.setState(data);
				});
			} else {
				console.log("取得登入資料失敗");
			}
		}, (err) => {
			console.log(`取得登入資料失敗：${err}`);
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
					<div className="container" style={{marginTop: "65px", width: "820px"}}>
						<Switch>
							<Route exact path="/app/login" render={(props) => (
								<Login appState={this.state} notify={this.notify} changeLoginState={this.changeLoginState} {...props} />
							)} />
							<Route exact path="/app/signUp" render={(props) => (
								<SignUpForm appState={this.state} notify={this.notify} changeLoginState={this.changeLoginState} {...props} />
							)} />
							<Route exact path="/app(/b/[^/]+)*" render={(props) => (
								<Board appState={this.state} notify={this.notify} {...props} />
							)} />
							<Route path="/app(/b/[^/]+)*/a/:articleName" render={(props) => (
								<Article appState={this.state} notify={this.notify} {...props} />
							)} />
							<Route path="/app/verification" render={(props) => (
								<Verification appState={this.state} notify={this.notify} {...props} />
							)} />
						</Switch>
					</div>
					<NotificationSystem ref="notificationSystem" />
				</div>
			</Router>
		);
	}
}


ReactDOM.render(
	<App />,
	document.getElementById("root")
);
