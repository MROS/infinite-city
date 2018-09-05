import React from "react";

function asyncComponent(importModule, name) {
	class AsyncComponent extends React.Component {
		constructor(props) {
			super(props);

			this.state = {
				component: null
			};
		}

		async componentDidMount() {
			if (name == undefined) {
				name = "default";
			}
			const component = (await importModule())[name];

			this.setState({
				component: component
			});
		}

		render() {
			const C = this.state.component;

			return C ? <C {...this.props} /> : <div />;
		}
	}

	return AsyncComponent;
}

export default asyncComponent;