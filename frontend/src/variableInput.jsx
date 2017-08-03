import React from "react";

// props 有 data, dataForm(得知輸入的格式)、changeUpper(改變上層資料)、oneline(若爲真則使用input，假則使用textarea)
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
		const restrictStr = findRestrict(label);
		if (restrictStr.trim().length == 0) {
			return true;
		} else {
			const verifyFunction = eval(`(${restrictStr})`);
			const data = this.props.data.toJS();
			return verifyFunction(data[label], data);
		}
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
								{
									this.props.oneline == true ?
										<input
											value={this.props.data.get(item.label)}
											onChange={this.onChangeData(item.label)}
											className={this.isValid(item.label) ? "input is-success" : "input is-danger"}
											placeholder={item.label} />
										:
										<textarea
											value={this.props.data.get(item.label)}
											onChange={this.onChangeData(item.label)}
											className={this.isValid(item.label) ? "textarea is-success" : "textarea is-danger"}
											placeholder={item.label} />
								}
							</div>
						);
					})
				}
			</div>
		);
	}
}

export default VariableInput;