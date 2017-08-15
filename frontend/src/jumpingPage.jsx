import React from "react";
export default class JumpingPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			timer: null
		};
	}
	componentDidMount() {
		let timer = setTimeout(() => {
			this.props.history.goBack();
		}, 5000);
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