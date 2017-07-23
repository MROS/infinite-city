import React from "react";
import { Link } from "react-router-dom";
import example from "./example";

class Article extends React.Component {
	constructor(props) {
		// props 要有屬性 commentForm, renderComment, content, renderContent
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
		return (
			<div>
				<Link to={"/app/b/" + match.params.boardName}>
					<div style={{marginBottom: "10px"}}>
						回{match.params.boardName}板
					</div>
				</Link>
				 <h4 className="title is-4" style={{marginBottom: "8px"}}>{match.params.articleName}</h4>
				<div>
					{
						this.state.content.split("\n").map((p) => {
							if (p == "") { return <br />; }
							else { return <p>{p}</p>; }
						})
					}
				</div>
				 <div>
					<h5 className="title is-5">留言區</h5>
					<hr />
					 {
						this.state.comments.map((comment) => {
							return (
								<div>
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