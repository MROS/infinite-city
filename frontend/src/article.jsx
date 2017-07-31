import React from "react";
import { Link } from "react-router-dom";
import example from "./example";

class Article extends React.Component {
	constructor(props) {
		// props 要有屬性 commentForm, renderComment, content, renderArticleContent
		// state 則有 
		// - comments，裡面都是 comment，爲一個陣列，內部可爲字串或函數
		super(props);
		this.state = {
			content: example.exampleArticle,
			comments: [
				{user: "yc0304", content: "甲"},
				{user: "lturtsamuel", content: "姆咪姆咪"},
				{user: "痛哭的人", content: "痛哭流涕"},
			]
		};
	}
	render() {
		const match = this.props.match;
		const location = this.props.location;
		const sp = location.pathname.split("/");
		const boardURL = sp.slice(0, location.length - 2).join("/");
		return (
			<div>
				<Link to={boardURL}>
					<div style={{marginBottom: "10px"}}>
						回看板
					</div>
				</Link>
				 <h4 className="title is-4" style={{marginBottom: "8px"}}>{match.params.articleName}</h4>
				<div>
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
									<span style={{ color: "blue" }}>{comment.user}</span>
									<span>：</span>
									<span>{comment.content}</span>
									<hr />
								</div>
							);
						})
					}
				</div>
				<div className="field has-addons" style={{ marginBottom: "25px" }}>
					<div className="control is-expanded">
						<input className="input" type="text" placeholder="說點什麼吧" />
					</div>
					<div className="control">
						<a className="button">我來留言</a>
					</div>
				</div>
			</div>
		);
	}
}

export default Article;