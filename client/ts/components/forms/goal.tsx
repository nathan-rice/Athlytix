import * as React from 'react';
import * as moment from 'moment';
import {connect} from 'react-redux';
import {reduxForm, Field, formValueSelector} from 'redux-form';
import {Col, ControlLabel, DropdownButton, FormGroup, InputGroup, MenuItem} from "react-bootstrap";
import {
    Distance, EnduranceExerciseSelectInput, FieldInput, Form, Girth, SelectInput,
    StrengthExerciseSelectInput, Time
} from "./common";
import {IDatedRecord} from "../../models";
import {xdate} from "../../common";

const WeightGoal = () => (
    <FormGroup controlId="goal-measurement-type">
        <Col componentClass={ControlLabel} xs={2}>Weight</Col>
        <Col xs={10}><Field name="value" component={FieldInput} type="number"/></Col>
    </FormGroup>
);

const BodyfatGoal = () => (
    <FormGroup controlId="goal-measurement-type">
        <Col componentClass={ControlLabel} xs={2}>Bodyfat %</Col>
        <Col xs={10}><Field name="value" component={FieldInput} type="number"/></Col>
    </FormGroup>
);

const GirthGoal = () => (
    <div>
        <Girth controlId="goal-measurement-location"/>
        <FormGroup controlId="goal-measurement-type">
            <Col componentClass={ControlLabel} xs={2}>Girth</Col>
            <Col xs={10}><Field name="value" component={FieldInput} noValidate step={0.125} type="number"/></Col>
        </FormGroup>
    </div>
);


const StrengthGoal = () => (
    <div>
        <FormGroup controlId="goal-strength-exercise">
            <Col componentClass={ControlLabel} xs={2}>Exercise</Col>
            <Col xs={10}>
                <Field name="exercise" props={{clearable: false}} component={StrengthExerciseSelectInput}/>
            </Col>
        </FormGroup>
        <FormGroup controlId="goal-strength-weight">
            <Col componentClass={ControlLabel} xs={2}>Weight</Col>
            <Col xs={10}><Field name="value" component={FieldInput} step={2.5} noValidate type="number"/></Col>
        </FormGroup>
        <FormGroup controlId="goal-strength-reps">
            <Col componentClass={ControlLabel} xs={2}>Reps</Col>
            <Col xs={10}><Field name="repetitions" component={FieldInput} type="number"/></Col>
        </FormGroup>
    </div>
);

const EnduranceGoal = () => {
    return (
        <div>
            <FormGroup controlId="goal-endurance-exercise">
                <Col componentClass={ControlLabel} xs={2}>Exercise</Col>
                <Col xs={10}><Field name="exercise" component={EnduranceExerciseSelectInput}/></Col>
            </FormGroup>
            <Distance controlId="goal-endurance-distance"/>
            <Time controlId="goal-endurance-time"/>
        </div>
    );
};

const goalSelector = formValueSelector('goal');
const goalConnector = connect((state, props: { onSubmit?: Function, data?: IDatedRecord }) => {
    let data = props.data || state.root.modal.data || {},
        parameters = data.parameters || {},
        dateInput = goalSelector(state, 'date'),
        date = dateInput && xdate(dateInput) || data.date && xdate(data.date) || state.selected_date,
        goal_type_id = data.goal_type_id || goalSelector(state, 'goal_type_id') || 1,
        initialValues = {...data, ...parameters, goal_type_id, date: date.format("YYYY-MM-DD")};
    if (data.goal_type_id == 4 && parameters.fixed == "distance") {
        initialValues.hours = Math.floor(data.value / 3600);
        initialValues.minutes = Math.floor((data.value % 3600) / 60);
        initialValues.seconds = data.value % 60;
    }
    return {...props, date, goal_type_id, initialValues}
});


export const GoalForm = goalConnector(reduxForm({form: "goal"})(props => {
    let {handleSubmit, change, date, onSubmit, goal_type_id} = props, goalTypeForm,
        addDays = d => () => {
            return change('date', date.clone().add(d, 'days').format("YYYY-MM-DD"))
        },
        goalTypeProps = {
            options: [
                {label: "Weight", value: 1},
                {label: "Bodyfat", value: 2},
                {label: "Strength", value: 3},
                {label: "Endurance", value: 4},
                {label: "Girth", value: 5}
            ], clearable: false
        };
    if (goal_type_id == 1) goalTypeForm = <WeightGoal/>;
    else if (goal_type_id == 2) goalTypeForm = <BodyfatGoal/>;
    else if (goal_type_id == 3) goalTypeForm = <StrengthGoal/>;
    else if (goal_type_id == 4) goalTypeForm = <EnduranceGoal/>;
    else if (goal_type_id == 5) goalTypeForm = <GirthGoal/>;
    return (
        <Form id="goal" onSubmit={handleSubmit(onSubmit || console.log)}>
            <div className="page-header-small">
                <p>Setting goals is an important motivator to fitness success. Based on your recorded progress,
                    Athlytix can automatically determine the probability that you will achieve a given goal by a
                    specified date.
                </p>
            </div>
            <FormGroup controlId="goal-date">
                <Col componentClass={ControlLabel} xs={2}>Date</Col>
                <Col xs={10}>
                    <InputGroup>
                        <Field name="date" props={{value: date.format("YYYY-MM-DD")}} component={FieldInput}
                               type="date"/>
                        <DropdownButton componentClass={InputGroup.Button} id="goal-add-days-dropdown" title="Add days">
                            <MenuItem key="1" onClick={addDays(30)}>30</MenuItem>
                            <MenuItem key="2" onClick={addDays(60)}>60</MenuItem>
                            <MenuItem key="3" onClick={addDays(90)}>90</MenuItem>
                            <MenuItem key="4" onClick={addDays(365)}>365</MenuItem>
                        </DropdownButton>
                    </InputGroup>
                </Col>

            </FormGroup>
            <FormGroup controlId="goal-type">
                <Col componentClass={ControlLabel} xs={2}>Type</Col>
                <Col xs={10}><Field name="goal_type_id" component={SelectInput} props={goalTypeProps}/></Col>
            </FormGroup>
            {goalTypeForm}
        </Form>
    );
}));