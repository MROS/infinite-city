import React from "react";
import { Link } from "react-router-dom";
export default class JumpingPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			timer: null
		};
		this.URLquery = {};
		this.props.location.search.slice(1).split("&").forEach((q) => {
			let [key, value] = q.split("=");
			this.URLquery[key] = value;
		});
	}
	componentDidMount() {
		let time = this.URLquery.time;
		console.log(time);
		if(!time) {
			time = 5000;
		}
		let timer = setTimeout(() => {
			this.props.history.goBack();
		}, time);
		this.setState({ timer });
	}
	componentWillUnmount() {
		let timer = this.state.timer;
		if(timer) {
			clearTimeout(timer);
		}
		this.setState({ timer: null });
	}
	render() {
		return (
			<div>
				{this.props.children}
			</div>
		);
	}
}