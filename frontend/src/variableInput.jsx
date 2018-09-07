import React from "react";
import checkAPI from "../../isomorphic/checkAPI.js";
import { SourceCode } from "./sourceCode.jsx";
import { fromJS } from "immutable";

// props 有 data, dataForm(得知輸入的格式)、changeUpper(改變上層資料)、oneline(若爲真則使用input，假則使用textarea)
class VariableInput extends React.Component {
	constructor(props) {
		super(props);

		let showLabels = {};
		this.props.dataForm.forEach(item => { showLabels[item.label] = false; });
		this.state = {
			show: fromJS(showLabels)
		};

		this.onChangeData = this.onChangeData.bind(this);
		this.isValid = this.isValid.bind(this);
		this.toggleSource = this.toggleSource.bind(this);
	}
	componentWillReceiveProps(nextProps) {
		if (this.props.dataForm != nextProps.dataForm) {
			let showLabels = {};
			nextProps.dataForm.forEach(item => { showLabels[item.label] = false; });
			console.log(showLabels);
			this.setState({
				show: fromJS(showLabels)
			});
		}
	}
	isValid(label) {
		const data = this.props.data.toJS();
		return checkAPI.checkMatchRestrict(label, data, this.props.dataForm.toJS());
	}
	toggleSource(label) {
		return () => {
			this.setState({
				show: this.state.show.update(label, x => !x)
			});
		};
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
						let label = item.get("label");
						return (
							<div key={label}>
								<div className="field has-addons" style={{marginBottom: "8px"}}>
									<p className="control is-expanded">
										{
											this.props.oneline == true ?
												<input
													value={this.props.data.get(label)}
													onChange={this.onChangeData(label)}
													className={this.isValid(label) ? "input is-success" : "input is-danger"}
													placeholder={label} /> :
												<textarea
													value={this.props.data.get(label)}
													onChange={this.onChangeData(label)}
													className={this.isValid(label) ? "textarea is-success" : "textarea is-danger"}
													placeholder={label} />
										}
									</p>
									<p className="control">
										<a
											className="button"
											onClick={this.toggleSource(label)}
											data-balloon-pos="up"
											data-balloon={`${this.state.show.get(label) ? "隱藏" : "顯示"}限制條件`}
										>
											<span className="icon is-small">
												{
													this.state.show.get(label) ?
														<img src="/img/eye-off.svg" /> :
														<img src="/img/eye.svg" />
												}
											</span>
										</a>
									</p>
								</div>
								<div>
									{
										this.state.show.get(label) ?
											<div className="box" style={{marginBottom: "15px"}}>
												<div style={{marginBottom: "5px" }}>
													<div>標籤：{label}</div>
													<div>
														型別：
														<span className="tag is-info">{item.get("evalType")}</span>
													</div>
												</div>
												<div>
													限制條件：<SourceCode code={item.get("restrict")} />
												</div>
											</div> :
											""
									}
								</div>
							</div>
						);
					})
				}
			</div>
		);
	}
}

export default VariableInput;