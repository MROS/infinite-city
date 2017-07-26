export default {
	count: function (name) {
		let t = 0;
		for (comment in this.comments) {
			if (comment.vote == name) t++;
		}
		return t;
	},
	viewersVote: function() {
		let t = Infinity.Viewer.comments[0];
		if(t.vote) return t.vote;
		else return "你還沒投票";
	},

	content: function () {
		let counts = this.items.map((item) => this.count.bind(this, item));
		return [
			"到無限城投票囉~~",
			"統計區",
			...counts,
			"你的投票：",
			this.viewersVote.bind(this)
		];
	},

	renderArticleContent: Default.renderArticleContent,

	commentForm: function() {
		return [
			{
				name: "vote",
				restriction: function (s) {
					return (this.items.includes(s));
				},
			},
			{ name: "msg" }
		];
	},
	
	/* 版主制定更高階的渲染函數
	renderCommentForm: function (articleObj) {
		return (<div><b>推</b> <b>噓</b> <span>{articleObj.renderCommentForm()}</span></div>);
	},*/

	renderCommentForm: Default.renderCommentForm,

	renderComment: function (commentObj) {
		let s = "";
		s += commentObj.vote + "</br></br>";
		s += commentObj.msg;
	},
	// beforeComment: function() {
	// 	for(let c of this.comments) {
	// 		if(c.userID == Viewer.id) return false;
	// 	}
	// 	return true;
	// }
};