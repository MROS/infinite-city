import React from "react";
import { checkId, checkEmail } from "../../isomorphic/checkAPI.js";
import JumpingPage from "./jumpingPage.jsx";

const WARNING_STYLE = {
	fontSize: "10px",
	color: "red"
};

class CheckUsedInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			used: false,
			invalid: true,
			first: true
		};
		this.onChangeData = this.onChangeData.bind(this);
	}
	onChangeData(event) {
		let data = event.target.value;
		if(!this.props.check(data)) {
			this.setState({ used: false, invalid: true });
			this.props.handleChange(null);
			this.setState({ first: false });
			return;
		}

		fetch(`${this.props.url}${encodeURIComponent(data)}`, {
			credentials: "same-origin"
		}).then(res => {
			return res.text();
		}).then(txt => {
			if(txt == "used") {
				this.setState({ used: true, invalid: false });
				this.props.handleChange(null);
			} else if(txt == "OK") {
				this.setState({ invalid: false, used: false });
				this.props.handleChange(data);
			} else {
				throw `未知的 response: ${txt}`;
			}
			this.setState({ first: false });
		}).catch(err => {
			console.log(err);
		});
	}
	render() {
		let ok = (!this.state.used && !this.state.invalid)
			|| (this.state.first && !this.props.submitFail);
		return (
			<div className="field">
				<p className="control has-icons-left">
					<input
						placeholder={this.props.label}
						onChange={this.onChangeData}
						className={ok ? "input is-sucess" : "input is-danger"}></input>
					<span className="icon is-small is-left">
						{this.props.children}
					</span>
				</p>
				{
					(() => {
						if(ok) {
							return;
						} else if(this.state.invalid) {
							return <p style={WARNING_STYLE}>不合法的{this.props.label}</p>;
						} else if(this.state.used) {
							return <p style={WARNING_STYLE}>此{this.props.label}已經被使用</p>;
						}
					})()
				}
			</div>
		);
	}
}

class CheckSamePassword extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			blank: true,
			diff: false,
			first: true
		};
	}
	onChangeData(label, event) {
		let data = event.target.value;
		if(label == "password") {
			this.password = data;
		} else if(label == "valid") {
			this.valid = data;
		}
		this.setState({ blank: data.length == 0 });
		this.setState({ diff: this.valid != this.password });
		this.setState({ first: false });
		if(this.valid == this.password && data.length > 0) {
			this.props.handleChange(data);
		} else {
			this.props.handleChange(null);
		}
	}
	render() {
		let ok = (!this.state.blank && !this.state.diff)
			|| (this.state.first && !this.props.submitFail );
		return (
			<div className="field">
				<div className="field">
					<p className="control has-icons-left">
						<input type="password"
							placeholder="密碼"
							onChange={this.onChangeData.bind(this, "password")}
							className={ok ? "input is-sucess" : "input is-danger"}></input>
						<span className="icon is-small is-left">
							<i className="fa fa-lock"></i>
						</span>
					</p>
				</div>
				<div className="field">
					<p className="control has-icons-left">
						<input type="password"
							placeholder="確認密碼"
							onChange={this.onChangeData.bind(this, "valid")}
							className={ok ? "input is-sucess" : "input is-danger"}></input>
						<span className="icon is-small is-left">
							<i className="fa fa-lock"></i>
						</span>
					</p>
					{
						(() => {
							if (ok) {
								return;
							} else if (this.state.diff) {
								return <p style={WARNING_STYLE}>兩次輸入不相同！</p>;
							} else if (this.state.blank) {
								return <p style={WARNING_STYLE}>輸入不可為空！</p>;
							}
						})()
					}
				</div>
			</div>
		);
	}
}

class SignUpForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			id: null,
			password: null,
			email: null,
			submitFail: false,
			justSuccess: false,
		};
	}
	submitForm() {
		let request = {};
		for(let key of ["id", "password", "email"]) {
			if(this.state[key]) {
				request[key] = this.state[key];
			} else {
				this.setState({ submitFail: true });
				this.props.notify({ message: "註冊失敗，請檢查表格內容是否正確", level: "error" });
				return;
			}
		}
		fetch("/api/user/new", {
			method: "POST",
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(request)
		}).then(res => {
			if (res.ok) {
				this.props.changeLoginState(true, this.state.id);
				this.setState({ justSuccess: true });
			} else {
				switch (res.status) {
					case 403:
						this.props.notify({message: `註冊失敗，名稱 ${this.state.id} 已被使用過`, level: "error"});
						break;
					default:
						this.props.notify({message: `註冊失敗，狀態碼 ${res.status}`, level: "error"});
				}
			}
		}).catch(err => {
			this.props.notify({ message: "AJAX失敗，註冊失敗", level: "error" });
		});
	}
	handleChange(key, tar) {
		let state_change = {};
		state_change[key] = tar;
		this.setState(state_change);
	}
	render() {
		if(this.state.justSuccess) {
			return (
				<JumpingPage history={this.props.history}>
					<p>恭喜！{this.state.id}</p>
					<p>您已經成功註冊，將在五秒內跳轉回<a onClick={this.props.history.goBack}>上個瀏覽頁面</a></p>
				</JumpingPage>
			);
		} else if (this.props.appState.login == true) {
			return (
				<p>您好，{this.props.appState.id}，請先登出再註冊</p>
			);
		} else {
			return (
				<div>
					<CheckUsedInput
						label="使用者名稱"
						url="/api/user/id-used?id="
						handleChange={this.handleChange.bind(this, "id")}
						submitFail={this.state.submitFail}
						check={checkId}> <i className="fa fa-user-o"></i> </CheckUsedInput>
					<CheckSamePassword
						submitFail={this.state.submitFail}
						handleChange={this.handleChange.bind(this, "password")} />
					<CheckUsedInput
						label="email"
						url="/api/user/email-used?email="
						handleChange={this.handleChange.bind(this, "email")}
						submitFail={this.state.submitFail}
						check={checkEmail}> <i className="fa fa-envelope"></i> </CheckUsedInput>
					<div className="field">
						<p className="control">
							<button className="button" onClick={this.submitForm.bind(this)}>
								註冊
							</button>
						</p>
					</div>
				</div>
			);
		}
	}
}

export default SignUpForm;