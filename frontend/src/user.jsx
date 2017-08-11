import React from "react";
import { Link } from "react-router-dom";

class IDPasswordForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			password: "",
			id: "",
			justSuccess: false,  // 剛註冊成功時會打開此旗標，渲染出註冊成功的消息，並在五秒後跳轉回首頁
		};
		this.handlePasswordChange = this.handlePasswordChange.bind(this);
		this.handleIDChange = this.handleIDChange.bind(this);
	}
	handlePasswordChange(event) {
		this.setState({password: event.target.value});
	}
	handleIDChange(event) {
		this.setState({id: event.target.value});
	}
	render() {
		if (this.state.justSuccess) {
			return (
				<div>
					<p>恭喜！{this.state.id}</p>
					<p>您已經成功{this.props.buttonName}，將在五秒內跳轉回<a onClick={this.props.history.goBack}>上個瀏覽頁面</a></p>
				</div>
			);
		}
		else if (this.props.appState.login == true) {
			return (
				<div>
					<p>您好！{this.props.appState.id}</p>
					<p>請先登出再{this.props.buttonName}</p>
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
							<button className="button" onClick={this.props.onSubmit.bind(this)}>
								{this.props.buttonName}
							</button>
						</p>
					</div>
				</div>
			);
		}
	}
}

function Login(props) {
	let onSubmit = function () {
		if (this.state.id.length == 0 || this.state.password.length == 0) {
			this.props.notify({ message: "帳號密碼皆不得爲空", level: "error" });
			return;
		}
		fetch("/api/user/login", {
			method: "POST",
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({id: this.state.id, password: this.state.password})
		}).then((res) => {
			if (res.ok) {
				this.props.changeLoginState(true, this.state.id);
				this.setState({
					justSuccess: true
				});
				setTimeout(() => {
					// XXX: 如果註冊頁就是瀏覽歷史中的第一頁，則這個跳轉行爲沒什麼意義
					// 然而，並不存在有效的方法能得知目前是否爲歷史中第一頁，因此不能捕捉此狀況
					if (window.location.pathname == "/app/login") {
						this.props.history.goBack();
					}
				}, 5000);
			} else {
				this.props.notify({ message: "帳號密碼錯誤", level: "error" });
			}
		}, (err) => {
			this.props.notify({ message: "AJAX失敗，登入失敗", level: "error" });
		});

	};
	return (
		<IDPasswordForm
			buttonName="登入"
			onSubmit={onSubmit}
			{...props} />
	);
}

function SignUp(props) {
	let onSubmit = function () {
		if (this.state.id.length == 0 || this.state.password.length == 0) {
			this.props.notify({ message: "帳號密碼皆不得爲空", level: "error" });
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
				this.props.changeLoginState(true, this.state.id);
				this.setState({
					justSuccess: true
				});
				setTimeout(() => {
					// XXX: 如果註冊頁就是瀏覽歷史中的第一頁，則這個跳轉行爲沒什麼意義
					// 然而，並不存在有效的方法能得知目前是否爲歷史中第一頁，因此不能捕捉此狀況
					// 若進入它頁之後又點回 /app/signUp 仍會跳轉，因此行爲仍不完美
					if (window.location.location == "/app/signUp") {
						this.props.history.goBack();
					}
				}, 5000);
			} else {
				switch (res.status) {
					case 403:
						this.props.notify({message: `註冊失敗，名稱 ${this.state.id} 已被使用過`, level: "error"});
						break;
					default:
						this.props.notify({message: `註冊失敗，狀態碼 ${res.status}`, level: "error"});
				}
			}
		}, (err) => {
			this.props.notify({message: "AJAX失敗，註冊失敗", level: "error"});
		});
	};
	return (
		<IDPasswordForm
			buttonName="註冊"
			onSubmit={onSubmit}
			{...props} />
	);
}


export {
	SignUp, Login
};