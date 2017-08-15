import React from "react";
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
			err_msg: null
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
				}
				return res.text();
			}).then(txt => {
				this.setState({ err_msg: txt, waiting: false });
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
					<p>{this.state.err_msg}</p>
				</div>
			);
		}
	}
}