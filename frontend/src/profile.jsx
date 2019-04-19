import "./css/profile.css";
import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { CheckDescription } from "./signup.jsx";

class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.id = this.props.location.pathname.split("/").slice(-1)[0];
		console.log(this.props.location.pathname);
		this.state = {
			articles: [],
			description: "",
			isExist: true,
			isFetched: false,
		};
		this.refresh = this.refresh.bind(this);
	}
	refresh() {
		const url = `/api/profile?id=${this.id}`;
		fetch(url, {
			method: "GET",
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json",
			},
		}).then((res) => {
			if (res.ok) {
				res.json().then((data) => {
					this.setState({
						articles: data.articles,
						description: data.description,
						isFetched: true
					});
				});
			} else {
				this.setState({ isExist: false, isFetched: true });
			}
		}, (err) => {
			console.log(`AJAX 失敗：${err}`);
		});

	}
	componentDidMount() {
		this.refresh();
	}
	render() {
		if (this.state.isExist) {
			return (
				<div>
					<Helmet>
						<title>{this.id} | 無限城</title>
					</Helmet>
					<div styleName="infoBlock">
						<h3 className="title is-5"><span styleName="userId">{this.id}</span> 的一句話簡介</h3>
						<hr />
						<UserDescription
							refresh={this.refresh}
							isMe={this.props.appState.id == this.id}
							description={this.state.description} />
					</div>
					<div styleName="infoBlock">
						<h3 className="title is-5"><span styleName="userId">{this.id}</span> 的所有文章</h3>
						<hr />
						<ArticleList isFetched={this.state.isFetched} articles={this.state.articles} />
					</div>
				</div>
			);
		} else {
			return (
				<div>
					<Helmet>
						<title>查無此 id</title>
					</Helmet>
					<h3 className="title is-5">{`${this.id} 的所有文章`}</h3>
					<hr />
					<div>查無此 id</div>
				</div>
			);
		}
	}
}

class UserDescription extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isEditing: false,
			descriptionTmp: this.props.description
		};
		this.startEditing = this.startEditing.bind(this);
		this.save = this.save.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}
	componentDidUpdate(prevProps) {
		if (prevProps.description != this.props.description) {
			this.setState({ descriptionTmp: this.props.description });
		}
	}
	startEditing() {
		this.setState({ isEditing: true });
	}
	save() {
		const url = "/api/profile";
		fetch(url, {
			method: "PUT",
			credentials: "same-origin",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ description: this.state.descriptionTmp })
		}).then((res) => {
			if (res.ok) {
				this.setState({ isEditing: false });
				this.props.refresh();
			} else {
				console.log("不明原因失敗");
			}
		}, (err) => {
			console.log(`AJAX 失敗：${err}`);
		});
	}
	handleChange(data) {
		this.setState({ descriptionTmp: data });
	}
	render() {
		if (this.props.isMe && !this.state.isEditing) {
			return (
				<div>
					<div styleName="description">{this.props.description}</div>
					<a className="button is-small" onClick={this.startEditing}>
						修改
					</a>
				</div>
			);
		} else if (this.props.isMe && this.state.isEditing) {
			return (
				<div>
					<CheckDescription
						description={this.state.descriptionTmp}
						handleChange={this.handleChange} />
					<a className="button is-small" onClick={this.save}>
						儲存
					</a>
				</div>
			);
		} else {
			return <div>{this.props.description}</div>;
		}
	}
}

function createUrl(board_path, article_title, article_id) {
	let url = "/app";
	for (let b of board_path) {
		url += "/b/";
		url += b;
	}
	url += "/a/";
	url += article_title;
	url += `?id=${article_id}`;
	return url;
}

function ArticleList(props) {
	if (!props.isFetched) {
		return <div></div>;
	}
	else if (props.articles.length == 0) {
		return "尚未發表任何文章";
	}

	let ret = [];
	for (let a of props.articles) {
		ret.push(
			<div key={a.id} style={{ marginLeft: "16px" }}>
				<Link to={createUrl(a.path, a.title, a.id)}>{a.title}</Link>
			</div>
		);
	}
	return ret;
}


export default Profile;