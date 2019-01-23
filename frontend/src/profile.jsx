import React from "react";
import { Link } from "react-router-dom";

class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.id = this.props.location.pathname.split("/").slice(-1)[0];
		this.state = {
			articles: [],
			isExist: true
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
					this.setState({ articles: data });
				});
			} else {
				this.setState({ isExist: false });
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
					<ArticleList articles={this.state.articles}/>
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

function ArticleList(props) {
	if (props.articles.length == 0) {
		return "尚未發表任何文章";
	}

	let ret = [];
	for (let a of props.articles) {
		ret.push(
			<div key={a._id} style={{ marginLeft: "16px" }}>
				<Link to={`/a/${a.title}?id=${a._id}`}>{a.title}</Link>
			</div>
		);
	}
	return ret;
}


export default Profile;