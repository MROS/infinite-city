import React from "react";
import { fromJS, Map, List } from "immutable";
import { Link } from "react-router-dom";
import VariableInput from "./variableInput.jsx";
import { LabelArrayToObject, LabelObjectToArray } from "./util";
import SourceCode from "./sourceCode.jsx";

function ruleToState(rules) {
	let ret = {};
	Object.keys(rules).forEach((ruleName) => {
		ret[ruleName] = {};
		rules[ruleName].checkbox.forEach((option) => {
			 ret[ruleName][option.name] = true;
		});
		rules[ruleName].textarea.forEach((option) => {
			 ret[ruleName][option.name] = "";
		});
		rules[ruleName].formRule.forEach((option) => {
			 ret[ruleName][option.name] = [{ label: "", restrict: "", evalType: "string" }];
		});
	});
	return fromJS(ret);
}

class Extendable extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div style={{ marginBottom: "35px" }}>
				<h5 className="title is-5">{this.props.name}</h5>
				{
					(() => {
						if (this.props.isExtended) {
							return (
								<div>
									<a onClick={this.props.toggle}>收起</a>
									{this.props.children}
								</div>
							);
						} else {
							return <a onClick={this.props.toggle}>展開</a>;
						}
					})()
				}
			</div>
		);
	}
}

class Checkbox extends React.Component {
	constructor(props) {
		super(props);
		this.onChange = this.onChange.bind(this);
	}
	onChange(event) {
		this.props.changeUpper(event.target.checked);
	}
	render() {
		return (
			<div className="field">
				<label className="checkbox">
					<input
						onChange={this.onChange}
						checked={this.props.checked}
						name={this.props.option.name}
						type="checkbox" />
					{this.props.option.display}
				</label>
			</div>
		);
	}
}

class TextArea extends React.Component {
	constructor(props) {
		super(props);
		this.onChange = this.onChange.bind(this);
	}
	onChange(event) {
		this.props.changeUpper(event.target.value);
	}
	render() {
		return (
			<div className="field">
				<label className="label">{this.props.option.display}</label>
				<div className="control">
					<textarea
						value={this.props.value}
						onChange={this.onChange}
						name={this.props.option.name}
						className="textarea"
						placeholder={this.props.option.display} />
				</div>
			</div>
		);
	}
}

// TODO: 設定限制條件，避免使用者送出無意義規則
class FormRule extends React.Component {
	constructor(props) {
		super(props);
		this.addItem = this.addItem.bind(this);
		this.deleteItem = this.deleteItem.bind(this);
		this.changeLabel = this.changeLabel.bind(this);
		this.changeRestrict = this.changeRestrict.bind(this);
		this.changeEvaltype = this.changeEvaltype.bind(this);
	}
	addItem() {
		const newValue = this.props.value.push(Map({ label: "", restrict: "", evalType: "string" }));
		this.props.changeUpper(newValue);
	}
	deleteItem(index) {
		return () => {
			console.log(index);
			const newValue = this.props.value.delete(index);
			console.log(newValue.toObject());
			this.props.changeUpper(newValue);
		};
	}
	changeLabel(index) {
		return (event) => {
			const newItem = this.props.value.get(index).set("label", event.target.value);
			const newValue = this.props.value.set(index, newItem);
			this.props.changeUpper(newValue);
		};
	}
	changeRestrict(index) {
		return (event) => {
			const newItem = this.props.value.get(index).set("restrict", event.target.value);
			const newValue = this.props.value.set(index, newItem);
			this.props.changeUpper(newValue);
		};
	}
	changeEvaltype(index) {
		return (event) => {
			const newItem = this.props.value.get(index).set("evalType", event.target.value);
			const newValue = this.props.value.set(index, newItem);
			this.props.changeUpper(newValue);
		};
	}
	render() {
		return (
			<div className="field">
				<label className="label">{this.props.option.display}</label>
				<div className="control">
					{
						this.props.value.map((v, index) => {
							return (
								<div key={index}>
									<div style={{ width: "100%" }}>
										{`欄位 ${index + 1}`}
										<a style={{ color: "red", float: "right" }}
											onClick={this.deleteItem(index)}>
											刪除
										</a>
									</div>
									<input
										className="input"
										onChange={this.changeLabel(index)}
										value={v.get("label")}
										placeholder={"標籤名 " + (index + 1)} />
									<textarea
										value={v.get("restrict")}
										onChange={this.changeRestrict(index)}
										className="textarea"
										placeholder="限制條件"/>
									<div className="select">
										<select value={v.get("evalType")} onChange={this.changeEvaltype(index)}>
											<option value="string">字串（單純文字）</option>
											<option value="function">函式</option>
										</select>
									</div>
								</div>
							);
						})
					}
					<a className="button" style={{marginTop: "15px"}} onClick={this.addItem}>更多欄位</a>
				</div>
			</div>
		);
	}
}

// props 傳入 ruleDefinition, ruleState, setRules
class RuleGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			show: Map({
				formRules: false,
				renderRules: false,
				backendRules: false,
			})
		};
		this.toggleExtendable = this.toggleExtendable.bind(this);
		this.handleRuleChange = this.handleRuleChange.bind(this);
		this.createExtendable = this.createExtendable.bind(this);
	}
	toggleExtendable(someRules) {
		return () => {
			this.setState({
				show: this.state.show.set(someRules, !this.state.show.get(someRules))
			});
		};
	}
	handleRuleChange(rule, name) {
		return (value) => {
			this.props.setRules(this.props.ruleState.setIn([rule, name], value));
		};
	}
	createExtendable(someRules) {
		return (
			<Extendable
				key={someRules}
				name={this.props.ruleDefinition[someRules].display}
				toggle={this.toggleExtendable(someRules)}
				isExtended={this.state.show.get(someRules)}>
				{
					[
						...this.props.ruleDefinition[someRules].checkbox.map((option) => {
							return (
								<Checkbox
									key={option.name}
									option={option}
									checked={this.props.ruleState.get(someRules).get(option.name)}
									changeUpper={this.handleRuleChange(someRules, option.name)} />
							);
						}),
						...this.props.ruleDefinition[someRules].textarea.map((option) => {
							return (
								<TextArea
									key={option.name}
									option={option}
									value={this.props.ruleState.get(someRules).get(option.name)}
									changeUpper={this.handleRuleChange(someRules, option.name)} />
							);
						}),
						...this.props.ruleDefinition[someRules].formRule.map((option) => {
							return (
								<FormRule
									key={option.name}
									option={option}
									changeUpper={this.handleRuleChange(someRules, option.name)}
									value={this.props.ruleState.get(someRules).get(option.name)} />
							);
						}),
					]
				}
			</Extendable>
		);
	}
	render() {
		return (
			<div>
				{
					Object.keys(this.props.ruleDefinition).map((someRules) => {
						return this.createExtendable(someRules);
					})
				}
			</div>
		);
	}
}

class CreateArticle extends React.Component {
	constructor(props) {
		super(props);
		this.rules = {
			formRules: {
				display: "表單規則",
				checkbox: [],
				textarea: [],
				formRule: [
					{ display: "留言表單格式", name: "commentForm" },
				]
			},
			renderRules: {
				display: "渲染規則",
				checkbox: [],
				textarea: [
					{ display: "留言渲染函式", name: "renderComment" },
				],
				formRule: []
			},
			backendRules: {
				display: "權限限制",
				checkbox: [],
				textarea: [
					{ display: "閱讀文章", name: "onEnter" },
					{ display: "留言", name: "onComment" },
				],
				formRule: []
			}
		};
		let initArticle = {};
		this.props.articleForm.forEach((item) => {
			initArticle[item.label] = "";
		});
		this.state = {
			title: "",
			articleContent: fromJS(initArticle),
			rules: ruleToState(this.rules),
		};
		this.handleTitleChange = this.handleTitleChange.bind(this);
		this.handleOnSubmit = this.handleOnSubmit.bind(this);
		this.setRules = this.setRules.bind(this);
		this.setArticleContent = this.setArticleContent.bind(this);
	}
	handleTitleChange(event) {
		this.setState({
			title: event.target.value
		});
	}
	handleOnSubmit() {
		let { title, articleContent, rules } = this.state;
		articleContent = LabelObjectToArray(articleContent.toJS(), this.props.articleForm);
		let article = {
			title,
			articleContent,
			formRules: rules.get("formRules").toObject(),
			renderRules: rules.get("renderRules").toObject(),
			backendRules: rules.get("backendRules").toObject()
		};
		this.props.newArticle(article);
	}
	setRules(rules) {
		this.setState({
			rules: rules
		});
	}
	setArticleContent(articleContent) {
		console.log(articleContent.toJS());
		this.setState({
			articleContent: articleContent
		});
	}
	render() {
		return (
			<div>
				<div className="field" style={{marginBottom: "35px"}}>
					<label className="label">標題</label>
					<div className="control">
						<input
							onChange={this.handleTitleChange}
							className="input"
							type="text"
							placeholder="標題" />
					</div>
				</div>
				<div className="field" style={{marginBottom: "35px"}}>
					<label className="label">文章內容</label>
					<VariableInput
						data={this.state.articleContent}
						dataForm={this.props.articleForm}
						changeUpper={this.setArticleContent}/>
				</div>
				<RuleGroup
					ruleDefinition={this.rules}
					ruleState={this.state.rules}
					setRules={this.setRules}/>
				<div className="field">
					<div className="control">
						<button onClick={this.handleOnSubmit} className="button is-primary">送出</button>
					</div>
				</div>
			</div>
		);
	}
}

class CreateBoard extends React.Component {
	constructor(props) {
		super(props);
		this.rules = {
			formRules: {
				display: "表單規則",
				checkbox: [
					{ display: "可定義文章表單", name: "canDefArticleForm" },
					{ display: "可定義留言表單", name: "canDefCommentForm" },
				],
				textarea: [],
				formRule: [
					{ display: "文章表單格式", name: "articleForm" },
					{ display: "留言表單格式", name: "commentForm" },
				]
			},
			renderRules: {
				display: "渲染規則",
				checkbox: [
					{ display: "可定義標題", name: "canDefTitle" },
					{ display: "可定義文章內容", name: "canDefArticleContent" },
					{ display: "可定義留言", name: "canDefComment" },
				],
				textarea: [
					{ display: "標題渲染函式", name: "renderTitle" },
					{ display: "文章內容渲染函式", name: "renderArticleContent" },
					{ display: "留言渲染函式", name: "renderComment" },
				],
				formRule: []
			},
			backendRules: {
				display: "權限限制",
				checkbox: [],
				textarea: [
					{ display: "進入看板（文章）", name: "onEnter" },
					{ display: "創建看板", name: "onNewBoard" },
					{ display: "發文", name: "onNewArticle" },
					{ display: "留言", name: "onComment" },
				],
				formRule: []
			}
		};
		this.state = {
			name: "",
			rules: ruleToState(this.rules),
		};
		this.handleNameChange = this.handleNameChange.bind(this);
		this.handleOnSubmit = this.handleOnSubmit.bind(this)	;
		this.setRules = this.setRules.bind(this);
	}
	handleNameChange(event) {
		this.setState({
			name: event.target.value
		});
	}
	handleOnSubmit() {
		let { name, rules } = this.state;
		let board = {
			name,
			formRules: rules.get("formRules").toJS(),
			renderRules: rules.get("renderRules").toJS(),
			backendRules: rules.get("backendRules").toJS()
		};
		this.props.newBoard(board);
	}
	setRules(rules) {
		this.setState({
			rules: rules
		});
	}
	render() {
		return (
			<div>
				<div className="field" style={{marginBottom: "35px"}}>
					<label className="label">看板名稱</label>
					<div className="control">
						<input onChange={this.handleNameChange} className="input" type="text" placeholder="看板名稱" />
					</div>
				</div>
				<RuleGroup
					ruleDefinition={this.rules}
					ruleState={this.state.rules}
					setRules={this.setRules}/>
				<div className="field">
					<div className="control">
						<button onClick={this.handleOnSubmit} className="button is-primary">送出</button>
					</div>
				</div>
			</div>
		);
	}
}

function BoardSource(props) {
	console.log(props);
	const onSeries = ["onEnter", "onNewBoard", "onNewArticle", "onComment"];
	return (
		<div>
			{
				onSeries.map((f) => {
					return (
						<div>
							{f}
							<SourceCode key={f} code={props[f][0]} language="javascript" />
						</div>
					);
				})
			}
		</div>
	);
}

class Board extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showPanel: "",             // 要顯示發文 or 創板 or 看板原始碼
			boards: [],
			articles: [],
			showBoard: false,
			showArticle: false,
		};
		this.newBoard = this.newBoard.bind(this);
		this.newArticle = this.newArticle.bind(this);
		this.changePanel = this.changePanel.bind(this);
	}
	countPath() {
		const urlPath = this.props.location.pathname;
		const path = urlPath.split("/").slice(2).filter((ele, index) => index % 2 == 1);
		return path;
	}
	componentDidMount() {
		this.getBoardData();
	}
	componentDidUpdate(prevProps, prevState) {
		if (prevProps.location.pathname != this.props.location.pathname) {
			this.state = {
				showPanel: "",             // 要顯示發文 or 創板 or 看板原始碼
				boards: [],
				articles: [],
				showBoard: false,
				showArticle: false,
			};
			this.getBoardData();
		}
	}
	getBoardData() {
		const path = this.countPath();
		const url = (path.length == 0) ? "/api/board/browse" : `/api/board/browse?name=${path.join(",")}`;
		console.log(url);
		fetch(url, {
			credentials: "same-origin"
		}).then((res) => {
			if (res.ok) {
				res.json().then((data) => {
					switch (data) {
						case "FAIL":
							console.log("取得看板資料失敗");
							break;
						default:
							console.log("取得看板資料成功");
							console.log(data);
							this.boardID = data.board._id;
							const boards = data.b_list;
							const articles = data.a_list;
							const showBoard = boards.length >= articles.length;
							const showArticle = !showBoard;
							this.setState({
								boards, articles, showBoard, showArticle,
								articleForm: data.board.articleForm,
								board: data.board
							});
					}
				});
			} else {
				console.log("取得看板資料：非正常失敗");
			}
		}, (err) => {
			console.log("AJAX失敗，取得看板資料失敗");
		});
	}
	changePanel(panel) {
		return () => {
			if (this.state.showPanel == panel) {
				this.setState({ showPanel: "" });
			} else {
				this.setState({ showPanel: panel });
			}
		};
	}
	newArticle(articleDefinition) {
		let body = articleDefinition;
		body.board = this.boardID;
		console.log("發文");
		console.log(JSON.stringify(body, null, 2));
		fetch("/api/article/new", {
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
						console.log(`發文成功，文章 ID 爲：${data._id}`);
					} else {
						console.log(`發文失敗：${data}`);
					}
				});
			} else {
				res.text().then((data) => {
					console.log(`發文失敗：${data}`);
				});
			}
		}, (err) => {
			console.log("AJAX失敗，發文失敗");
		});
	}
	newBoard(boardDefinition) {
		let body = boardDefinition;
		body.parent = this.boardID;
		console.log("試創建新看板：");
		console.log(JSON.stringify(body, null, 2));
		fetch("/api/board/new", {
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
						console.log(`創建看板成功，看板 ID 爲：${data._id}`);
					} else {
						console.log(`創建看板失敗：${data}`);
					}
				});
			} else {
				res.text().then((data) => {
					console.log(`創建看板：非正常失敗, ${data}`);
				});
			}
		}, (err) => {
			console.log("AJAX失敗，創建看板失敗");
		});
	}
	render() {
		const location = this.props.location;
		return (
			<div>
				<div style={{fontSize: "24px", marginBottom: "30px"}}>
					當前看板：
					{
						(() => {
							let urlPath = "/app";
							let result = [
								<Link key={urlPath} to={urlPath}><span>根</span></Link>
							];
							for (let boardName of this.countPath()) {
								urlPath += `/b/${boardName}`;
								result.push(<span key={urlPath + "/"}> / </span>);
								result.push(<Link key={urlPath} to={urlPath}><span>{boardName}</span></Link>);
							}
							return result;
						})()
					}
				</div>
				<div style={{ marginBottom: "30px" }}>
					{
						(() => {
							if(this.props.appState.login) {
								return ([
									<a className={this.state.showPanel == "createArticle" ? "button is-success" : "button"}
										key="createArticle"
										style={{ marginBottom: "15px", marginRight: "12px" }}
										onClick={this.changePanel("createArticle")}>
										發文
									</a>,
									<a className={this.state.showPanel == "createBoard" ? "button is-success" : "button"}
										key="createBoard"
										style={{ marginBottom: "15px", marginRight: "12px" }}
										onClick={this.changePanel("createBoard")}>
										創建新板
									</a>
								]);
							}
						})()
					}
					<a className={this.state.showPanel == "watchSource" ? "button is-success" : "button"}
						style={{ marginBottom: "15px" }}
						onClick={this.changePanel("watchSource")}>
						觀看看板源碼
					</a>
				</div>
				{
					(() => {
						switch (this.state.showPanel) {
							case "createArticle":
								return (
									<div className="box" style={{ marginBottom: "30px" }}>
										<h4 className="title is-4">發文</h4>
										<CreateArticle
											newArticle={this.newArticle}
											articleForm={this.state.articleForm}/>
									</div>
								);
							case "createBoard":
								return (
									<div className="box" style={{ marginBottom: "30px" }}>
										<h4 className="title is-4">創建新版</h4>
										<CreateBoard newBoard={this.newBoard} />
									</div>
								);
							case "watchSource":
								return (
									<div style={{ marginBottom: "30px" }}>
										<BoardSource {...this.state.board} />
									</div>
								);
							default:
								return "";
						}
					})()
				}
				<div style={{marginBottom: "30px"}}>
					<h5 className="title is-5">
						<span>看板 </span>
						<a onClick={() => {this.setState({showBoard: !this.state.showBoard});}}>
							{this.state.showBoard ? "收起" : "展開"}
						</a>
					</h5>
					{
						(() => {
							if (this.state.showBoard) {
								return this.state.boards.map((board) => {
									return (
										<div key={board.name}>
											<Link to={location.pathname + "/b/" + board.name}>{board.name}</Link>
										</div>
									);
								});
							} else {
								return;
							}
						})()
					}
				</div>
				<div style={{marginBottom: "30px"}}>
					<h5 className="title is-5">
						<span>文章 </span>
						<a onClick={() => {this.setState({showArticle: !this.state.showArticle});}}>
							{this.state.showArticle ? "收起" : "展開"}
						</a>
					</h5>
					{
						(() => {
							if (this.state.showArticle) {
								return this.state.articles.map((article) => {
									return (
										<div key={article._id}>
											<Link to={`${location.pathname}/a/${article.title}?id=${article._id}`}>{article.title}</Link>
										</div>
									);
								});
							} else {
								return;
							}
						})()
					}
				</div>
			</div>
		);
	}
}

export default Board;