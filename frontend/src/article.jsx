import React from "react";
import { Link } from "react-router-dom";
import example from "./example";

class InputComment extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			comment: ""
		};
		this.onChangeComment = this.onChangeComment.bind(this);
		this.onSubmitComment = this.onSubmitComment.bind(this);
	}
	onChangeComment(event) {
		this.setState({
			comment: event.target.value
		});
	}
	onSubmitComment() {
		this.props.submitComment(this.state.comment);
	}
	render() {
		return (
			<div className="field has-addons" style={{ marginBottom: "25px" }}>
				<div className="control is-expanded">
					<input
						onChange={this.onChangeComment}
						value={this.state.comment}
						className="input"
						type="text"
						placeholder="說點什麼吧" />
				</div>
				<div className="control">
					<a className="button" onClick={this.onSubmitComment}>
						留言
					</a>
				</div>
			</div>
		);
	}
}

class Article extends React.Component {
	constructor(props) {
		// props 要有屬性 commentForm, renderComment, content, renderArticleContent
		// state 則有 
		// - comments，裡面都是 comment，爲一個陣列，內部可爲字串或函數
		super(props);
		this.state = {
			content: "",
			comments: []
		};
		this.URLquery = {};
		this.props.location.search.slice(1).split("&").forEach((q) => {
			let [key, value] = q.split("=");
			this.URLquery[key] = value;
		});
		this.countPath = this.countPath.bind(this);
		this.getArticleData = this.getArticleData.bind(this);
		this.submitComment = this.submitComment.bind(this);
	}
	countPath() {
		const urlPath = this.props.location.pathname;
		let path = urlPath.split("/").slice(2).filter((ele, index) => index % 2 == 1);
		path = path.slice(0, path.length - 1);
		return path;
	}
	formatDate(date) {
		if (date == undefined) {
			return "";
		} else {
			const y = date.getFullYear();
			const m = date.getMonth() + 1;
			const d = date.getDate();
			return `${y}年${m}月${d}日 ${date.toLocaleTimeString()}`;
		}
	}
	getArticleData() {
		const path = this.countPath();
		const url = (path.length == 0) ? `/api/article/browse?id=${this.URLquery.id}` : `/api/article/browse??id=${this.URLquery.id}&name=${path.join(",")}`;
		console.log(url);
		fetch(url, {
			credentials: "same-origin"
		}).then((res) => {
			if (res.ok) {
				res.json().then((data) => {
					switch (data) {
						case "FAIL":
							console.log("取得文章資料失敗");
							break;
						default:
							console.log("取得文章資料成功");
							console.log(data);
							this.setState({
								author: data.author,
								title: data.title,
								date: new Date(data.date),
								content: data.articleContent.join(""),
								comments: data.comment
							});
					}
				});
			} else {
				console.log("取得文章資料：非正常失敗");
			}
		}, (err) => {
			console.log("AJAX失敗，取得文章資料失敗");
		});
	}
	submitComment(msg) {
		const url = "/api/comment/new";
		const body = {
			msg,
			article: this.URLquery.id
		};
		console.log(JSON.stringify(body));
		fetch(url, {
			method: "POST",
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body)
		}).then((res) => {
			if (res.ok) {
				res.text().then((data) => {
					switch (data) {
						case "OK":
							console.log("留言成功");
							break;
						case "尚未登入":
							console.log("留言：尚未登入");
							break;
						default:
							console.log(`留言：不明狀況 ${data}`);
					}
				});
			} else {
				console.log("留言：非正常失敗");
			}
		}, (err) => {
			console.log("AJAX失敗，留言失敗");
		});
	}
	componentDidMount() {
		this.getArticleData();
	}
	render() {
		const match = this.props.match;
		const location = this.props.location;
		const sp = location.pathname.split("/");
		const boardURL = sp.slice(0, sp.length - 2).join("/");
		return (
			<div>
				<Link to={boardURL}>
					<div style={{marginBottom: "10px"}}>
						回看板
					</div>
				</Link>
				<div style={{ marginBottom: "28px" }}>
					<h3 className="title is-3">{match.params.articleName}</h3>
					<div>
						<div>作者：{this.state.author}</div>
						<div>{this.formatDate(this.state.date)}</div>
					</div>
				</div>
				<div style={{marginBottom: "25px"}}>
					{
						this.state.content.split("\n").map((p, index) => {
							if (p == "") { return <br key={index} />; }
							else { return <p key={index}>{p}</p>; }
						})
					}
				</div>
				<div>
					<h5 className="title is-5">留言區</h5>
					<hr />
					{
						this.state.comments.map((comment, index) => {
							return (
								<div key={index}>
									<span style={{ color: "blue" }}>{comment.author}</span>
									<span>：</span>
									<span>{comment.msg}</span>
									<hr />
								</div>
							);
						})
					}
				</div>
				<InputComment submitComment={this.submitComment}/>
			</div>
		);
	}
}

export default Article;