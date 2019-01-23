import React from "react";
import { Link } from "react-router-dom";

class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.id = this.props.location.pathname.split("/").slice(-1)[0];
		console.log(this.props.location.pathname);
		this.state = {
			articles: [],
			isExist: true,
			isFetched: false,
		};
	}
	componentDidMount() {
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
					this.setState({ articles: data, isFetched: true });
				});
			} else {
				this.setState({ isExist: false, isFetched: true });
			}
		}, (err) => {
			console.log(`AJAX 失敗：${err}`);
		});

	}
	render() {
		if (this.state.isExist) {
			return (
				<div>
					<h3 className="title is-5">{`${this.id} 的所有文章`}</h3>
					<hr />
					<ArticleList isFetched={this.state.isFetched} articles={this.state.articles}/>
				</div>
			);
		} else {
			return (
				<div>
					<h3 className="title is-5">{`${this.id} 的所有文章`}</h3>
					<hr />
					<div>查無此 id</div>
				</div>
			);
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