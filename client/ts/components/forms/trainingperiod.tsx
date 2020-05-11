import * as React from 'react';
import {connect} from "react-redux";
import {reduxForm, Field} from 'redux-form';
import {Form, Col, ControlLabel, FormControl, FormGroup, HelpBlock} from "react-bootstrap";
import Select from 'react-select';
import {Actions} from "../../state/actions";
import {IAppState} from "../../state/root";
import {Search} from "../../state/search";
import {xdate} from "../../common";


const ProgramSelector = ({value, onChange}) => {
    let loadOptions = input => Search.program({query: input})
            .then(results => ({options: results}));
    return (
        <Select.Async
            openOnFocus
            value={value}
            simpleValue
            onChange={onChange}
            loadOptions={loadOptions}/>
    );
};

const trainingPeriodConnector = connect((s: IAppState, p: any) => {
    let data = p.data || s.root.modal.data || {}, start_date,
        user = s.root.users[s.root.selected_user_id];
    if (data.start_date) start_date = xdate(data.start_date).format("YYYY-MM-DD");
    return {user, initialValues: {difficulty: 0.5, ...data, start_date}, ...p};
});

class TrainingPeriodForm_ extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {...props.initialValues}
    }

    onSubmit(e) {
        e.preventDefault();
        this.props.onSubmit(this.state);
    }

    render() {
        return (
            <Form horizontal id="training-period" onSubmit={e => this.onSubmit(e)}>
                <div className="page-header-small">
                </div>
                <FormGroup controlId="training-period-start-date">
                    <Col componentClass={ControlLabel} xs={2}>Start Date</Col>
                    <Col xs={10}>
                        <FormControl value={this.state.start_date} type="date"
                                     onChange={(e: any) => this.setState({start_date: e.target.value})}/>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} xs={2}>Program</Col>
                    <Col xs={10}>
                        <ProgramSelector value={this.state.program_id}
                                         onChange={v => this.setState({program_id: v})}/>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} xs={2}>Difficulty</Col>
                    <Col xs={10}>
                        <FormControl type="range" min={0} max={1} step={0.05} value={this.state.difficulty}
                                     onChange={(e: any) => this.setState({difficulty: e.target.value})}/>
                        <HelpBlock>
                            You shouldn't need to change this setting under normal circumstances. If you do change this
                            setting, it is strongly recommended that you do so in small, gradual steps.
                        </HelpBlock>
                    </Col>
                </FormGroup>
            </Form>
        );
    }
}

export const TrainingPeriodForm = trainingPeriodConnector(TrainingPeriodForm_);