import * as React from 'react';
import * as moment from 'moment';
import {connect} from 'react-redux';
import {reduxForm, Field, formValueSelector} from 'redux-form';
import {Col, ControlLabel, FormGroup} from "react-bootstrap";
import {FieldInput, Form, Distance, Time, EnduranceExerciseSelectInput, RadioInput} from "./common";
import {IDatedRecord} from "../../models";
import {xdate} from "../../common";

const enduranceSelector = formValueSelector('endurance_achievement');
const enduranceConnector = connect((state, props: { onSubmit?: Function, data?: IDatedRecord }) => {
    let d = props.data || state.root.modal.data || {},
        date = d.date && xdate(d.date) || state.selected_date || xdate(),
        distance_type_id = enduranceSelector(state, 'distance_type_id') || d.distance_type_id || 1,
        exercise = enduranceSelector(state, 'exercise') || d.exercise,
        duration = d.time && moment.utc(d.time * 1000),
        hours = d.time && duration.hours() || undefined,
        minutes = d.time && duration.minutes() || undefined,
        seconds = d.time && duration.seconds() || undefined,
        fixed = "distance",
        initialValues = {
            ...d, fixed, date: date.format("YYYY-MM-DD"), exercise, distance_type_id, hours, minutes, seconds
        };
    return {...props, initialValues, exercise: enduranceSelector(state, 'exercise')}
});

export const EnduranceAchievementForm = enduranceConnector(reduxForm({form: "endurance_achievement"})(props => {
    let {data, onSubmit, handleSubmit} = props,
        timeProps = {inline: true, title: "Time", value: "time"},
        distanceProps = {inline: true, title: "Distance", value: "distance"};
    return (
        <Form id="endurance-achievement" onSubmit={handleSubmit(onSubmit || console.log)}>
            <div className="page-header-small">
            <p>Have you set a new personal record for how quickly you were able to go certain distance, or how much
                distance you were able to cover in a certain time? Record it here, and we'll use it to predict how your
                endurance is increasing over time.</p>
            </div>
            <FormGroup controlId="endurance-achievement-date">
                <Col componentClass={ControlLabel} xs={2}>Date</Col>
                <Col xs={10}><Field name="date" component={FieldInput} type="date"/></Col>
            </FormGroup>
            <FormGroup controlId="endurance-achievement-exercise">
                <Col componentClass={ControlLabel} xs={2}>Exercise</Col>
                <Col xs={10}><Field name="exercise" component={EnduranceExerciseSelectInput}/></Col>
            </FormGroup>
            <Distance controlId="endurance-achievement-distance"/>
            <Time controlId="endurance-achievement-time"/>
            <FormGroup controlId="endurance-achievement-fixed">
                <Col componentClass={ControlLabel} xs={2}>Fixed</Col>
                <Col xs={10}>
                    <Field name="fixed" component={RadioInput} props={timeProps} defaultChecked={data.fixed == "time"}/>
                    <Field name="fixed" component={RadioInput} props={distanceProps}
                           defaultChecked={data.fixed != "time"}/>
                </Col>
            </FormGroup>
            <FormGroup controlId="endurance-achievement-climb">
                <Col componentClass={ControlLabel} xs={2}>Climb</Col>
                <Col xs={10}><Field name="climb" component={FieldInput} step={1} noValidate type="number"/></Col>
            </FormGroup>
            <FormGroup controlId="endurance-achievement-descent">
                <Col componentClass={ControlLabel} xs={2}>Descent</Col>
                <Col xs={10}><Field name="descent" component={FieldInput} step={1} noValidate type="number"/></Col>
            </FormGroup>
            <FormGroup controlId="endurance-achievement-altitude">
                <Col componentClass={ControlLabel} xs={2}>Altitude</Col>
                <Col xs={10}><Field name="altitude" component={FieldInput} step={1} noValidate type="number"/></Col>
            </FormGroup>
            <FormGroup controlId="endurance-achievement-average_heart_rate">
                <Col componentClass={ControlLabel} xs={2}>Avg Heart Rate</Col>
                <Col xs={10}><Field name="average_heart_rate" component={FieldInput} step={0.1} type="number"/></Col>
            </FormGroup>
        </Form>
    )
}));