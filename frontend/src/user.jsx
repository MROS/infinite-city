import React from "react";
import { Link } from "react-router-dom";
import JumpingPage from "./jumpingPage.jsx";

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
				<JumpingPage history={this.props.history}>
					<p>恭喜！{this.state.id}</p>
					<p>您已經成功{this.props.buttonName}，將在五秒內跳轉回<a onClick={this.props.history.goBack}>上個瀏覽頁面</a></p>
				</JumpingPage>
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
				this.setState({ justSuccess: true });
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


export {
	Login
};