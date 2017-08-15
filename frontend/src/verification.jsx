import React from "react";
import { Link } from "react-router-dom";

export default class Verification extends React.Component {
	constructor(props) {
		super(props);
		this.URLquery = {};
		this.props.location.search.slice(1).split("&").forEach((q) => {
			let [key, value] = q.split("=");
			this.URLquery[key] = value;
		});
		this.state = {
			waiting: true,
			ok: false,
		};
	}
	componentDidMount() {
		if(this.URLquery.guid) {
			fetch(`/api/user/verification?guid=${this.URLquery.guid}`, {
				credentials: "same-origin"
			}).then(res => {
				if(res.ok) {
					console.log(123);
					this.setState({ ok: true, waiting: false });
				} else {
					this.setState({ ok: false });
					if(res.status == 401) {
						this.props.history.push("/app/login?time=0");
					} else if(res.status == 403) {
						this.setState({ ok: false, waiting: false });
					} else {
						console.log("未知的錯誤");
					}
				}
				return res.text();
			});
		}
	}
	render() {
		if(this.state.waiting) {
			return <div>請稍候...</div>;
		} else if(this.state.ok) {
			return (
				<div>
					<h1 className="title is-3">恭喜，{this.props.appState.id}！</h1>
					<p>你已經認證成功！趕快發表第一篇文章，開啟你的無限人生吧！</p>
				</div>
			);
		} else {
			return (
				<div>
					<h1 className="title is-3">發生了一點錯誤QmmQ</h1>
					<p>您的認證資料有誤或已過期，請點擊<Link to="/app">這裡</Link>重發認證信。</p>
				</div>
			);
		}
	}
}