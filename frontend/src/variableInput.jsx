import React from "react";

// props 有 data, dataForm(得知輸入的格式)、changeUpper(改變上層資料)
class VariableInput extends React.Component {
	constructor(props) {
		super(props);

		this.onChangeData = this.onChangeData.bind(this);
		this.isValid = this.isValid.bind(this);
	}
	isValid(label) {
		const findRestrict = (label) => {
			let ans = "";
			for (let item of this.props.dataForm) {
				if (item.label == label) {
					ans = item.restrict;
					break;
				}
			}
			return ans;
		};
		const verifyFunction = eval(`(${findRestrict(label)})`);
		const data = this.props.data.toJS();
		return verifyFunction(data[label], data);
	}
	onChangeData(label) {
		return (event) => {
			this.props.changeUpper(this.props.data.set(label, event.target.value));
		};
	}
	render() {
		return (
			<div className="field" style={{ marginBottom: "25px" }}>
				{
					this.props.dataForm.map((item) => {
						return (
							<div key={item.label} className="control is-expanded">
								<input
									value={this.props.data.get(item.label)}
									onChange={this.onChangeData(item.label)}
									className={this.isValid(item.label) ? "input is-success" : "input is-danger"}
									type="text"
									placeholder={item.label} />
							</div>
						);
					})
				}
			</div>
		);
	}
}

export default VariableInput;