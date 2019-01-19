import React from "react";
import { fromJS, Map } from "immutable";
import { Link } from "react-router-dom";
import { VariableInput, InputWithCheck } from "./form.jsx";
import util from "./util";
import { ShowOnSeries, ShowFormSeries } from "./sourceCode.jsx";
import checkAPI from "../../isomorphic/checkAPI.js";

function ruleToState(rules, upperForm) {
	let ret = {};
	["renderRules", "backendRules"].forEach((ruleName) => {
		ret[ruleName] = {};
		rules[ruleName].textarea.forEach((option) => {
			ret[ruleName][option.name] = "";
		});
	});
	ret["formRules"] = {};
	Object.keys(upperForm).forEach((formName) => {
		ret["formRules"][formName] = upperForm[formName].map(x => util.pick(["label", "restrict", "evalType"], x));
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
				{
					this.props.ok ?
						< h5 className="title is-5">{this.props.name}</h5> :
						< h5 className="title is-5">
							<span style={{marginRight: "3px"}}>⚠️</span>
							{this.props.name}
						</h5>
				}
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
					<InputWithCheck
						value={this.props.value}
						onChange={this.onChange}
						ok={this.props.check(this.props.value)}
						name={this.props.option.name}
						type="textarea"
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
		this.validLabel = this.validLabel.bind(this);
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
	uniqueLabel(label) {
		return this.props.value.map(item => item.get("label")).filter(l => l == label).size == 1;
	}
	validLabel(label) {
		return checkAPI.checkLabel(label) && this.uniqueLabel(label);
	}
	render() {
		return (
			<div className="field">
				<label className="label">{this.props.option.display}</label>
				<div>
					{	this.props.value.size == 0 ?
						<div style={{ color: "orange", fontSize: "22px" }}> 警告！沒有任何欄位</div> :
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
									<InputWithCheck
										onChange={this.changeLabel(index)}
										value={v.get("label")}
										ok={this.validLabel(v.get("label"))}
										type="text"
										placeholder={"標籤名 " + (index + 1)} />
									<InputWithCheck
										value={v.get("restrict")}
										onChange={this.changeRestrict(index)}
										ok={checkAPI.checkRestrict(v.get("restrict"))}
										type="textarea"
										placeholder="限制條件" />
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
					<a className="button" style={{ marginTop: "15px" }} onClick={this.addItem}>更多欄位</a>
				</div>
			</div>
		);
	}
}

// props 傳入 ruleDefinitions, ruleState, setRules
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
	render() {
		return (
			<div>
				{
					Object.keys(this.props.ruleDefinitions).map((someRule) => {
						const ruleDef = this.props.ruleDefinitions[someRule];
						const ruleState = this.props.ruleState.get(someRule);
						const ruleStateTransform = Object.values(ruleState.toJS());
						return (
							<Extendable
								ok={checkAPI.allOK(ruleStateTransform, ruleDef.check)}
								key={someRule}
								name={ruleDef.display}
								toggle={this.toggleExtendable(someRule)}
								isExtended={this.state.show.get(someRule)}>
								{
									[
										...ruleDef.textarea.map((option) => {
											return (
												<TextArea
													key={option.name}
													check={ruleDef.check}
													option={option}
													changeUpper={this.handleRuleChange(someRule, option.name)}
													value={ruleState.get(option.name)}
												/>
											);
										}),
										...ruleDef.formRule.map((option) => {
											return (
												<FormRule
													key={option.name}
													option={option}
													changeUpper={this.handleRuleChange(someRule, option.name)}
													value={ruleState.get(option.name)}
												/>
											);
										}),
									]
								}
							</Extendable>
						);
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
				check: checkAPI.checkFormSeries,
				display: "表單規則",
				textarea: [],
				formRule: [
					{ display: "留言表單格式", name: "commentForm" },
				]
			},
			renderRules: {
				check: checkAPI.checkRenderSeries,
				display: "渲染規則",
				textarea: [
					{ display: "留言渲染函式", name: "renderComment" },
				],
				formRule: []
			},
			backendRules: {
				check: checkAPI.checkOnSeries,
				display: "權限限制",
				textarea: [
					{ display: "閱讀文章", name: "onEnter" },
					{ display: "留言", name: "onComment" },
				],
				formRule: []
			}
		};
		let initArticle = {};
		this.props.articleForm.forEach((item) => {
			initArticle[item.get("label")] = "";
		});
		const upperForm = {
			commentForm: this.props.commentForm,
		};
		this.state = {
			title: "",
			articleContent: fromJS(initArticle),
			rules: ruleToState(this.rules, upperForm),
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
		articleContent = util.LabelObjectToArray(articleContent.toJS(), this.props.articleForm.toJS());
		let article = {
			title,
			articleContent,
			formRules: rules.get("formRules").toJS(),
			renderRules: rules.get("renderRules").toJS(),
			backendRules: rules.get("backendRules").toJS()
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
				<div className="field" style={{ marginBottom: "35px" }}>
					<label className="label">標題</label>
					<div className="control">
						<InputWithCheck
							ok={checkAPI.checkArticleTitle(this.state.title)}
							value={this.state.title}
							type="text"
							onChange={this.handleTitleChange}
							placeholder="標題" />
					</div>
				</div>
				<div className="field" style={{ marginBottom: "35px" }}>
					<label className="label">文章內容</label>
					<VariableInput
						data={this.state.articleContent}
						dataForm={this.props.articleForm}
						changeUpper={this.setArticleContent} />
				</div>
				<RuleGroup
					ruleDefinitions={this.rules}
					ruleState={this.state.rules}
					setRules={this.setRules} />
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
				check: checkAPI.checkFormSeries,
				textarea: [],
				formRule: [
					{ display: "文章表單格式", name: "articleForm" },
					{ display: "留言表單格式", name: "commentForm" },
				]
			},
			renderRules: {
				display: "渲染規則",
				check: checkAPI.checkRenderSeries,
				textarea: [
					// { display: "標題渲染函式", name: "renderTitle" },
					{ display: "文章內容渲染函式", name: "renderArticleContent" },
					{ display: "留言渲染函式", name: "renderComment" },
				],
				formRule: []
			},
			backendRules: {
				display: "權限限制",
				check: checkAPI.checkOnSeries,
				textarea: [
					{ display: "進入看板（文章）", name: "onEnter" },
					{ display: "創建看板", name: "onNewBoard" },
					{ display: "發文", name: "onNewArticle" },
					{ display: "留言", name: "onComment" },
				],
				formRule: []
			}
		};
		const upperForm = {
			articleForm: this.props.articleForm,
			commentForm: this.props.commentForm,
		};
		this.state = {
			name: "",
			rules: ruleToState(this.rules, upperForm),
		};
		this.handleNameChange = this.handleNameChange.bind(this);
		this.handleOnSubmit = this.handleOnSubmit.bind(this);
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
				<div className="field" style={{ marginBottom: "35px" }}>
					<label className="label">看板名稱</label>
					<div className="control">
						<InputWithCheck
							ok={checkAPI.checkBoardName(this.state.name)}
							value={this.state.name}
							type="text"
							onChange={this.handleNameChange}
							placeholder="標題" />
					</div>
				</div>
				<RuleGroup
					ruleDefinitions={this.rules}
					ruleState={this.state.rules}
					setRules={this.setRules} />
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
	const onSeries = ["onEnter", "onNewBoard", "onNewArticle", "onComment"];
	const formSeries = ["articleForm", "commentForm"];
	return (
		<div>
			<div>
				<h4 className="title is-4">表單規則</h4>
				{
					formSeries.map((name) => {
						const formItems = props[name];
						return (
							<div>
								{
									formItems ?
										<ShowFormSeries
											key={name}
											name={name}
											items={formItems}
										/> :
										""
								}
							</div>
						);
					})
				}
			</div>
			<div>
				<h3 className="title is-4">權限限制</h3>
				{
					onSeries.map((name) => {
						if (props[name]) {
							return <ShowOnSeries key={name} name={name} funcs={props[name]} />;
						}
					})
				}
			</div>
		</div>
	);
}

class Board extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			exist: true,
			errorInfo: "",
			showPanel: "",             // 要顯示發文 or 創板 or 看板原始碼
			boards: [],
			articles: [],
			showBoard: false,
			showArticle: false,
			authority: {
				onNewArticle: false,
				onNewBoard: false,
			}
		};
		this.newBoard = this.newBoard.bind(this);
		this.newArticle = this.newArticle.bind(this);
		this.changePanel = this.changePanel.bind(this);
		this.boardLocation = this.boardLocation.bind(this);
	}
	countPath() {
		const urlPath = this.props.location.pathname;
		const path = urlPath.split("/").slice(2).filter((ele, index) => index % 2 == 1);
		return path;
	}
	componentDidMount() {
		this.getBoardData();
	}
	componentDidUpdate(prevProps) {
		if (prevProps.location.pathname != this.props.location.pathname) {
			this.state = {
				exist: true,
				errorInfo: "",
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
								articleForm: fromJS(data.board.articleForm),
								board: data.board,
								authority: data.authority,
							});
					}
				});
			} else {
				res.text().then((data) => {
					console.log(`取得看板資料：非正常失敗 ${data}`);
					this.setState({
						exist: false,
						errorInfo: `${res.status}: ${data}`,
					});
				});
			}
		}, (err) => {
			console.log(`AJAX失敗，取得看板資料失敗：${err.message}`);
		});
	}
	changePanel(panel) {
		return () => {
			let auth;
			switch (panel) {
				case "createArticle":
					auth = this.state.authority.onNewArticle;
					if (!auth.ok) {
						this.props.notify({ message: `發文權限不足：${auth.msg}`, level: "error" });
						return;
					}
				case "createBoard":
					auth = this.state.authority.onNewBoard;
					if (!auth.ok) {
						this.props.notify({ message: `創建看板權限不足：${auth.msg}`, level: "error" });
						return;
					}
				default:
					if (this.state.showPanel == panel) {
						this.setState({ showPanel: "" });
					} else {
						this.setState({ showPanel: panel });
					}
			}
		};
	}
	newArticle(articleDefinition) {
		let body = articleDefinition;
		if (!checkAPI.checkNewArticle(body, this.state.board.articleForm)) {
			this.props.notify({ message: "發文失敗，請檢查格式是否正確（消除所有警告）", level: "error" });
			return;
		}
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
						this.props.notify({ message: `發文成功，ID 爲 ${data._id}`, level: "success" });
						const path = `${this.props.location.pathname}/a/${body.title}?id=${data._id}`;
						this.props.history.push(path);
					} else {
						this.props.notify({ message: `發文失敗：${data}`, level: "error" });
					}
				});
			} else {
				res.text().then((data) => {
					this.props.notify({ message: `發文失敗：${data}`, level: "error" });
				});
			}
		}, (err) => {
			this.props.notify({ message: "AJAX失敗，發文失敗", level: "error" });
			console.log(`AJAX失敗，發文失敗：${err.message}`);
		});
	}
	newBoard(boardDefinition) {
		let body = boardDefinition;
		if (!checkAPI.checkNewBoard(body)) {
			this.props.notify({ message: "創建看板失敗，請檢查格式是否正確（消除所有警告）", level: "error" });
			return;
		}
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
						this.props.notify({ message: `創建看板成功，看板 ID 爲：${data._id}`, level: "success" });
						const path = `${this.props.location.pathname}/b/${body.name}`;
						this.props.history.push(path);
					} else {
						this.props.notify({ message: `創建看板失敗：${data}`, level: "error" });
					}
				});
			} else {
				res.text().then((data) => {
					this.props.notify({ message: `創建看板失敗：${data}`, level: "error" });
				});
			}
		}, (err) => {
			this.props.notify({ message: "AJAX失敗，創建看板失敗", level: "error" });
			console.log(`AJAX失敗，創建看板失敗：${err.message}`);
		});
	}
	boardLocation() {
		return (
			<div style={{ fontSize: "24px", marginBottom: "30px" }}>
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
		);
	}
	boardContent() {
		const location = this.props.location;
		return (
			<div>
				<div style={{ marginBottom: "30px" }}>
					<a className={this.state.showPanel == "createArticle" ? "button is-success" : "button"}
						key="createArticle"
						disabled={!this.state.authority.onNewArticle.ok}
						style={{ marginBottom: "15px", marginRight: "12px" }}
						onClick={this.changePanel("createArticle")}>
						發文
					</a>
					<a className={this.state.showPanel == "createBoard" ? "button is-success" : "button"}
						key="createBoard"
						disabled={!this.state.authority.onNewBoard.ok}
						style={{ marginBottom: "15px", marginRight: "12px" }}
						onClick={this.changePanel("createBoard")}>
						創建新板
					</a>
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
											articleForm={this.state.articleForm}
											commentForm={this.state.board.commentForm}
										/>
									</div>
								);
							case "createBoard":
								return (
									<div className="box" style={{ marginBottom: "30px" }}>
										<h4 className="title is-4">創建新版</h4>
										<CreateBoard
											newBoard={this.newBoard}
											articleForm={this.state.board.articleForm}
											commentForm={this.state.board.commentForm}
										/>
									</div>
								);
							case "watchSource":
								return (
									<div className="box" style={{ marginBottom: "30px" }}>
										<BoardSource {...this.state.board} />
									</div>
								);
							default:
								return "";
						}
					})()
				}
				<div style={{ marginBottom: "40px" }}>
					<h5 className="title is-5" style={{ marginBottom: "12px" }}>
						<a
							style={{ color: "purple" }}
							onClick={() => { this.setState({ showBoard: !this.state.showBoard }); }}>
							{this.state.showBoard ? <span><span className="icon">▼</span> 看板</span> : <span><span className="icon">▶</span> 看板</span>}
						</a>
					</h5>
					{
						(() => {
							if (this.state.showBoard) {
								return this.state.boards.map((board) => {
									return (
										<div key={board.name} style={{ marginLeft: "16px" }}>
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
				<div style={{ marginBottom: "30px" }}>
					<h5 className="title is-5" style={{ marginBottom: "12px" }}>
						<a
							style={{ color: "purple" }}
							onClick={() => { this.setState({ showArticle: !this.state.showArticle }); }}>
							{this.state.showArticle ? <span><span className="icon">▼</span> 文章</span> : <span><span className="icon">▶</span> 文章</span>}
						</a>
					</h5>
					{
						(() => {
							if (this.state.showArticle) {
								return this.state.articles.map((article) => {
									return (
										<div key={article._id} style={{ marginLeft: "16px" }}>
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
	render() {
		return (
			<div>
				{this.boardLocation()}
				{
					(() => {
						if (this.state.exist) {
							return this.boardContent();
						} else {
							return (
								<div>{this.state.errorInfo}</div>
							);
						}
					})()
				}
			</div>
		);
	}
}

export default Board;