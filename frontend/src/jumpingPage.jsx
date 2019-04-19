import React from "react";
import { Helmet } from "react-helmet";
export default class JumpingPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			timer: null
		};
	}
	componentDidMount() {
		let time = this.time;
		if(!time && time != 0) {
			time = 5000;
		}
		let timer = setTimeout(() => {
			if(this.props.path) {
				this.props.history.push(this.props.path);
			} else {
				this.props.history.goBack();
			}
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
				<Helmet><title>跳轉頁</title></Helmet>
				{this.props.children}
			</div>
		);
	}
}