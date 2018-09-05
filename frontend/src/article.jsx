import React from "react";
import { fromJS, List } from "immutable";
import { Link } from "react-router-dom";
import util from "./util";
import VariableInput from "./variableInput.jsx";
import checkAPI from "../../isomorphic/checkAPI.js";
import { SourceCode, ShowOnSeries } from "./sourceCode.jsx";

class InputComment extends React.Component {
	constructor(props) {
		super(props);

		this.createStatebyProps = this.createStatebyProps.bind(this);

		this.state = {
			comment: this.createStatebyProps(props),
			showOnCommentSource: false,
		};

		this.toggleOnCommentSource = this.toggleOnCommentSource.bind(this);
		this.isAllValid = this.isAllValid.bind(this);
		this.setComment = this.setComment.bind(this);
		this.onSubmitComment = this.onSubmitComment.bind(this);
	}
	createStatebyProps(props) {
		let initComment = {};
		props.commentForm.forEach((item) => {
			initComment[item.get("label")] = "";
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
	toggleOnCommentSource() {
		console.log(this.state.showOnCommentSource);
		this.setState({
			showOnCommentSource: !this.state.showOnCommentSource
		});
	}
	isAllValid() {
		const content = this.state.comment.toJS();
		const form = this.props.commentForm.toJS();
		return checkAPI.checkAllMatchRestrict(content, form);
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
			const commentContent = util.LabelObjectToArray(obj, this.props.commentForm.toJS());
			this.props.submitComment(commentContent);
		} else {
			console.log("未滿足條件，不發出請求");
		}
	}
	render() {
		if (this.props.authority.ok) {
			return (
				<div className="field" style={{ marginBottom: "25px" }}>
					<VariableInput
						oneline={true}
						data={this.state.comment}
						dataForm={this.props.commentForm}
						changeUpper={this.setComment} />
					<div className="control">
						<a className="button" onClick={this.onSubmitComment}>
							留言
						</a>
					</div>
				</div>
			);
		} else if (!this.props.authority.ok) {
			return (
				<div>
					{`你沒有留言權限：${this.props.authority.msg}`}
					<div style={{marginTop: "20px"}}>
						<a
							className={this.state.showOnCommentSource ? "button is-success" : "button"}
							onClick={this.toggleOnCommentSource}>
							觀看留言權限限制
						</a>
					</div>
					<div style={{marginTop: "40px"}}>
						{
							this.state.showOnCommentSource ?
								<ShowOnSeries name="留言限制" funcs={this.props.onComment}/> :
								""
						}
					</div>
				</div>
			);
		}
	}
}

function ContentSource(props) {
	const content = props.content;
	const functionText = props.functionText;
	return (
		<div>
			<div className="box" style={{marginBottom: "0px"}}>
				<h4 className="title is-4">原始資料</h4>
				{
					content.map((item) => {
						return (
							<div key={item.label}>
								<div>標籤：{item.label}</div>
								<div>型別：<span className="tag is-info">{item.evalType}</span></div>
								<SourceCode code={item.body} />
							</div>
						);
					})
				}
			</div>
			<div className="box">
				<h4 className="title is-4">渲染規則</h4>
				<SourceCode code={functionText} />
			</div>
		</div>
	);
}

function evaluateItem(item, exposedData) {
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
				return `[∞函式失敗：${item.label}∞]`;
			}
	}
}

function newLineToBr(str) {
	return str.split("\n").map((p, index) => {
		if (p == "") { return <br key={index} />; }
		else { return <span key={index}>{p}<br /></span>; }
	});
}

function RenderContent(props) {
	const { renderFunction, exposedData, content } = props;
	let evaluatedContent = {};
	content.forEach(item => {
		evaluatedContent[item.label] = evaluateItem(item, exposedData);
	});
	const order = content.map(item => item.label);

	let renderResult;
	try {
		renderResult = renderFunction(evaluatedContent, order);
		renderResult = newLineToBr(renderResult);
		return <span>{renderResult}</span>;
	} catch (error) {
		console.log(error);
		return <span style={{ color: "red" }}>[∞渲染函式失敗∞]</span>;
	}
}

function defaultRenderArticleFunction(content, order) {
	// 此爲預設渲染文章函式
	return order.map((label) => {
		return content[label];
	}).join("\n");
}

function defaultRenderCommentFunction(content, order) {
	// 此爲預設渲染留言函式
	return order.map((label) => {
		return content[label];
	}).join("\n");
}

class Article extends React.Component {
	constructor(props) {
		// props 要有屬性 commentForm, renderComment, content, renderArticleContent
		// state 則有 comments，裡面都是 comment，爲一個陣列，內部可爲字串或函數
		super(props);
		this.state = {
			showCommentSource: new List(),
			showArticleSource: false,
			authority: {
				onComment: {ok: false, msg: "尚未獲取文章資料"}
			},
			content: "",
			comments: [],
			commentForm: new List(),
			onComment: [],
			onEnter: [],
			articleContent: [],
			renderComment: defaultRenderCommentFunction,
			renderArticleContent: defaultRenderArticleFunction,
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
		this.toggleCommentSource = this.toggleCommentSource.bind(this);
		this.toggleArticleSource = this.toggleArticleSource.bind(this);
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
		return util.LabelArrayToObject(onlyString, item => item.body);
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
	renderArticle() {
		if (this.state.showArticleSource == true) {
			return <div>
				<ContentSource
					content={this.state.articleContent}
					functionText={this.state.renderArticleContent.toString()} />
				<div className="box">
					<h4 className="title is-4">權限限制</h4>
					{
						["onEnter", "onComment"].map((name) => {
							return <ShowOnSeries key={name} name={name} funcs={this.state[name]} />;
						})
					}
				</div>
			</div>;
		} else if (this.state.showArticleSource == false) {
			const exposedData = this.createExposedDataForArticle();
			return <RenderContent
				renderFunction={this.state.renderArticleContent}
				content={this.state.articleContent}
				exposedData={exposedData} />;
		}
	}
	toggleCommentSource(index) {
		return () => {
			if (!this.state.showCommentSource.has(index)) {
				this.setState({
					showCommentSource: this.state.showCommentSource.set(index, true)
				});
			} else {
				this.setState({
					showCommentSource: this.state.showCommentSource.update(index, x => !x)
				});
			}
		};
	}
	renderComments() {
		return this.state.comments.map((comment, index) => {
			const exposedData = this.createExposedDataForComment(comment, index);
			const showCommentSource = this.state.showCommentSource.get(index);
			return (
				<div key={index}>
					<div style={{ marginBottom: "5px", float: "right" }}>
						<a className={showCommentSource ? "button is-success" : "button"}
							style={{ fontSize: "10px" }}
							onClick={this.toggleCommentSource(index)}
							data-balloon-pos="up"
							data-balloon={`${showCommentSource ? "隱藏" : "顯示"}留言源碼`}
						>
							<span className="icon is-small">
								<i className="fa fa-code"></i>
							</span>
						</a>
					</div>
					<div>
						<span style={{ color: "blue" }}>{comment.author}</span>
						<span>：</span>
						<span>
							<RenderContent
								renderFunction={this.state.renderComment}
								exposedData={exposedData}
								content={comment.commentContent}
							/>
						</span>
					</div>
					{
						showCommentSource ?
							<div style={{ marginTop: "15px" }}>
								<ContentSource
									content={comment.commentContent}
									functionText={this.state.renderComment.toString()} />
							</div> :
							""
					}
					<hr style={{ marginBottom: "5px", marginTop: "15px" }} />
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
							function getRenderfunction(str, defaultFunction) {
								return checkAPI.IsFunctionString(str) ?
									eval(`(${str})`) : defaultFunction;
							}
							this.setState({
								author: data.author,
								title: data.title,
								date: new Date(data.date),
								articleContent: data.articleContent,
								commentForm: fromJS(data.commentForm),
								comments: data.comment,
								onComment: data.onComment,
								onEnter: data.onEnter,
								authority: data.authority,
								renderComment: getRenderfunction(data.renderComment, defaultRenderCommentFunction),
								renderArticleContent: getRenderfunction(data.renderArticleContent, defaultRenderArticleFunction),
							});
					}
				});
			} else {
				console.log("取得文章資料：非正常失敗");
			}
		}, (err) => {
			console.log(`AJAX失敗，取得文章資料失敗：${err.message}`);
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
						this.props.notify({ message: "留言成功", level: "success" });
						this.getArticleData();
					} else {
						this.props.notify({ message: `留言失敗：${data}`, level: "error" });
					}
				});
			} else {
				res.text().then((data) => {
					this.props.notify({ message: `留言失敗：${data}`, level: "error" });
				});
			}
		}, (err) => {
			this.props.notify({ message: "AJAX失敗，留言失敗", level: "error" });
			console.log(`AJAX失敗，留言失敗：${err.message}`);
		});
	}
	componentDidMount() {
		this.getArticleData();
	}
	toggleArticleSource() {
		this.setState({
			showArticleSource: !this.state.showArticleSource
		});
	}
	render() {
		const match = this.props.match;
		const location = this.props.location;
		const sp = location.pathname.split("/");
		const boardURL = sp.slice(0, sp.length - 2).join("/");
		return (
			<div style={{paddingBottom: "180p"}}>
				<div>
					<div style={{ float: "left" }}>
						<Link to={boardURL}>
							<div style={{ marginBottom: "10px" }}> 回看板 </div>
						</Link>
					</div>
					<div style={{ float: "right" }}>
						<a className="button" href="#commentArea">
							<span className="icon is-small">
								<i className="fa fa-comment-o"></i>
							</span>
						</a>
						<a
							className={this.state.showArticleSource ? "button is-success" : "button"}
							onClick={this.toggleArticleSource}
						>
							<span className="icon is-small">
								<i className="fa fa-code"></i>
							</span>
						</a>
					</div>
				</div>
				<div style={{ clear: "left", marginBottom: "32px", fontSize: "13px", color: "grey" }}>
					<h3 className="title is-3">{match.params.articleName}</h3>
					<div>
						<div>作者：{this.state.author}</div>
						<div>{this.formatDate(this.state.date)}</div>
					</div>
				</div>
				<div style={{ marginBottom: "25px" }}>
					{this.renderArticle()}
				</div>
				<div id="commentArea" style={{ marginBottom: "35px" }}>
					<h5 className="title is-5">留言區</h5>
					<hr style={{ marginBottom: "5px" }} />
					{this.renderComments()}
				</div>
				<div>
					<InputComment
						onComment={this.state.onComment}
						authority={this.state.authority.onComment}
						submitComment={this.submitComment}
						commentForm={this.state.commentForm} />
				</div>
			</div>
		);
	}
}

export default Article;