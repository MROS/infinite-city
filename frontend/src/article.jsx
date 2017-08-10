import React from "react";
import { fromJS, Map } from "immutable";
import { Link } from "react-router-dom";
import { LabelArrayToObject, LabelObjectToArray } from "./util";
import VariableInput from "./variableInput.jsx";

class InputComment extends React.Component {
	constructor(props) {
		super(props);

		this.createStatebyProps = this.createStatebyProps.bind(this);

		this.state = {
			comment: this.createStatebyProps(props)
		};

		this.isAllValid = this.isAllValid.bind(this);
		this.setComment = this.setComment.bind(this);
		this.onSubmitComment = this.onSubmitComment.bind(this);
	}
	createStatebyProps(props) {
		let initComment = {};
		props.commentForm.forEach((item) => {
			initComment[item.label] = "";
		});
		console.log(initComment);
		return fromJS(initComment);
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps != this.props) {
			this.setState({
				comment: this.createStatebyProps(nextProps)
			});
		}
	}
	isAllValid() {
		for (let item of this.props.commentForm) {
			if (item.restrict.trim().length == 0) {
				continue;
			} else {
				const verifyFunction = eval(`(${item.restrict})`);
				const comment = this.state.comment.toJS();
				const ok = verifyFunction(comment[item.label], comment);
				if (!ok) { return false; }
			}
		};
		return true;
	}
	setComment(comment) {
		console.log(comment.toJS());
		this.setState({
			comment: comment
		});
	}
	onSubmitComment() {
		if (this.isAllValid()) {
			const obj = this.state.comment.toJS();
			const commentContent = LabelObjectToArray(obj, this.props.commentForm);
			this.props.submitComment(commentContent);
		} else {
			console.log("未滿足條件，不發出請求");
		}
	}
	render() {
		return (
			<div className="field" style={{ marginBottom: "25px" }}>
				<VariableInput
					oneline={true}
					data={this.state.comment}
					dataForm={this.props.commentForm}
					changeUpper={this.setComment}/>
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
			comments: [],
			commentForm: [],
			articleContent: [],
		};
		this.URLquery = {};
		this.props.location.search.slice(1).split("&").forEach((q) => {
			let [key, value] = q.split("=");
			this.URLquery[key] = value;
		});
		this.countPath = this.countPath.bind(this);
		this.getArticleData = this.getArticleData.bind(this);
		this.submitComment = this.submitComment.bind(this);
		this.renderComments = this.renderComments.bind(this);
		this.renderArticle = this.renderArticle.bind(this);
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
	createContent(arr) {    // 過濾掉 evalType 不是字串的項目，並且將原陣列轉爲物件
		const onlyString = arr.filter(item => item.evalType == "string");
		return LabelArrayToObject(onlyString, item => item.body);
	}
	createComment(comment) {
		return {
			date: comment.date,
			author: comment.author,
			content: this.createContent(comment.commentContent)
		};
	}
	createExposedDataForArticle() {
		return {
			title: this.state.title,
			articleAuthor: this.state.author,
			articleContent: this.createContent(this.state.articleContent),
			comments: this.state.comments.map(comment => this.createComment(comment)),
		};
	}
	createExposedDataForComment(comment, index) {
		return {
			title: this.state.title,
			articleAuthor: this.state.author,
			articleContent: this.createContent(this.state.articleContent),
			comments: this.state.comments.map(comment => this.createComment(comment)),
			currentComment: this.createComment(comment),
			currentIndex: index,
		};
	}
	evaluateItem(item, exposedData) {
		switch (item.evalType) {
			case "string":
				return item.body;
			case "function":
				if (item.body.trim().length == 0) {
					return "";
				}
				try {
					const evalFunction = eval(`(${item.body})`);
					const result = evalFunction(exposedData);
					return result;
				} catch (error) {
					console.log(error);
					return "函式失敗";
				}
		}
	}
	renderArticle() {
		const exposedData = this.createExposedDataForArticle();
		return this.state.articleContent.map((item, index) => {
			return (
				<div key={index}>
					{
						this.evaluateItem(item, exposedData).split("\n").map((p, index) => {
							if (p == "") { return <br key={index} />; }
							else { return <p key={index}>{p}</p>; }
						})
					}
					<br />
				</div>
			);
		});
	}
	renderComments() {
		const renderComment = (comment, exposedData) => {
			return comment.commentContent.map(item => this.evaluateItem(item, exposedData));
		};
		return this.state.comments.map((comment, index) => {
			const exposedData = this.createExposedDataForComment(comment, index);
			return (
				<div key={index}>
					<span style={{ color: "blue" }}>{comment.author}</span>
					<span>：</span>
					<span>
						{ renderComment(comment, exposedData) }
					</span>
					<hr />
				</div>
			);
		});
	}
	getArticleData() {
		const path = this.countPath();
		const url = (path.length == 0) ? `/api/article/browse?id=${this.URLquery.id}` : `/api/article/browse?id=${this.URLquery.id}&name=${path.join(",")}`;
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
								articleContent: data.articleContent,
								commentForm: data.commentForm,
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
	submitComment(commentContent) {
		const url = "/api/comment/new";
		const body = {
			commentContent,
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
				res.json().then((data) => {
					if (data._id) {
						this.props.notify({message: "留言成功", level: "success"});
						this.getArticleData();
					} else {
						this.props.notify({message: `留言失敗：${data}`, level: "error"});
					}
				});
			} else {
				res.text().then((data) => {
					this.props.notify({message: `留言失敗：${data}`, level: "error"});
				});
			}
		}, (err) => {
			this.props.notify({message: "AJAX失敗，留言失敗", level: "error"});
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
					<div style={{marginBottom: "10px"}}> 回看板 </div>
				</Link>
				<div style={{ marginBottom: "28px" }}>
					<h3 className="title is-3">{match.params.articleName}</h3>
					<div>
						<div>作者：{this.state.author}</div>
						<div>{this.formatDate(this.state.date)}</div>
					</div>
				</div>
				<div style={{marginBottom: "25px"}}> { this.renderArticle() } </div>
				<div>
					<h5 className="title is-5">留言區</h5>
					<hr />
					{ this.renderComments() }
				</div>
				<InputComment
					submitComment={this.submitComment}
					commentForm={this.state.commentForm} />
			</div>
		);
	}
}

export default Article;