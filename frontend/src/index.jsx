import "bulma/css/bulma.min.css";
import "balloon-css/balloon.min.css";
import React from "react";
import ReactDOM from "react-dom";
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
} from "react-router-dom";
import NotificationSystem from "react-notification-system";
import asyncComponent from "./asyncComponent.jsx";

const Board = asyncComponent(() => import(/* webpackChunkName: "board" */ "./board.jsx"));
const Article = asyncComponent(() => import(/* webpackChunkName: "article" */ "./article.jsx"));
const Login = asyncComponent(() => import(/* webpackChunkName: "login" */ "./login.jsx"));
const SignUpForm = asyncComponent(() => import(/* webpackChunkName: "signup" */ "./signup.jsx"), "SignUpForm");
const StartVerifyForm = asyncComponent(() => import(/* webpackChunkName: "signup" */ "./signup.jsx"), "StartVerifyForm");


class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			login: false,
			id: "",
			burgerOpen: false,
		};
		this.changeLoginState = this.changeLoginState.bind(this);
		this.logout = this.logout.bind(this);
		this.notify = this.notify.bind(this);
		// TODO: 動態調節視窗時不會隨之變化
		this.isMobile = (window.innerWidth <= 1088);
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
	handleBurgerClick() {
		// Reference: https://bulma.io/documentation/components/navbar/
		this.setState({
			burgerOpen: !this.state.burgerOpen
		});
	}
	render() {
		return (
			<Router>
				<div>
					<nav className="navbar has-shadow is-spaced">
						<div className="container" style={this.isMobile ? {} : {maxWidth: "70%"}}>
							<div className="navbar-brand">
								<Link to="/app" className="navbar-item">
									<h3 className="title is-3">無限城</h3>
								</Link>
								<div className="navbar-burger" onClick={() => this.handleBurgerClick()}>
									<span />
									<span />
									<span />
								</div>
							</div>
							<div className={this.state.burgerOpen ? "navbar-menu is-active" : "navbar-menu"}>
								<div className="navbar-start">
									<Link to="/app" className="navbar-item">
										首頁
									</Link>
									<a className="navbar-item" target="_blank" rel="noopener" href="https://github.com/MROS/infinite-city/blob/master/doc/%E6%8C%87%E5%8D%97.md">
										指南
									</a>
								</div>
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
													<Link key="signUp" to="/app/start-verify" className="navbar-item">註冊</Link>
												];
											}
										})()
									}
								</div>
							</div>
						</div>
					</nav>
					<div className="container" style={this.isMobile ? {marginTop: "35px", width: "90%"} : {marginTop: "65px", width: "820px"}}>
						<Switch>
							<Route exact path="/app/login" render={(props) => (
								<Login appState={this.state} notify={this.notify} changeLoginState={this.changeLoginState} {...props} />
							)} />
							<Route exact path="/app/start-verify" render={(props) => (
								<StartVerifyForm appState={this.state} notify={this.notify} {...props} />
							)} />
							<Route exact path="/app/sign-up" render={(props) => (
								<SignUpForm appState={this.state} notify={this.notify} changeLoginState={this.changeLoginState} {...props} />
							)} />
							<Route exact path="/app(/b/[^/]+)*" render={(props) => (
								<Board appState={this.state} notify={this.notify} {...props} />
							)} />
							<Route path="/app(/b/[^/]+)*/a/:articleName" render={(props) => (
								<Article appState={this.state} notify={this.notify} {...props} />
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
