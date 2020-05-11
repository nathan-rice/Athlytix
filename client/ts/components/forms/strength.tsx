import * as React from 'react';
import {reduxForm, Field, formValueSelector} from 'redux-form';
import {Col, ControlLabel, FormGroup} from "react-bootstrap";
import {FieldInput, Form, StrengthExerciseSelectInput, dataConnector, MediaInput} from "./common";

export const StrengthAchievementForm = dataConnector(reduxForm({form: "strength_achievement"})(props => {
    let {handleSubmit, onSubmit, data} = props,
        exerciseProps = {value: data.exercise};
    return (
        <Form id="strength-achievement" onSubmit={handleSubmit(onSubmit || console.log)}>
            <div className="page-header-small">
                <p>Have you set a new personal record for the amount of weight you've lifted or the number of reps
                    you were able to hit with a given weight? Record it here, and we'll use it estimate how your
                    strength is changing over time.</p>
            </div>
            <FormGroup controlId="strength-achievement-date">
                <Col componentClass={ControlLabel} xs={2}>Date</Col>
                <Col xs={10}>
                    <Field name="date" component={FieldInput} type="date"/>
                </Col>
            </FormGroup>
            <FormGroup controlId="strength-achievement-exercise">
                <Col componentClass={ControlLabel} xs={2}>Exercise</Col>
                <Col xs={10}>
                    <Field name="exercise" component={StrengthExerciseSelectInput} props={exerciseProps}/>
                </Col>
            </FormGroup>
            <FormGroup controlId="strength-achievement-weight">
                <Col componentClass={ControlLabel} xs={2}>Weight</Col>
                <Col xs={10}>
                    <Field name="weight" component={FieldInput} noValidate props={{step: 5}} type="number"/>
                </Col>
            </FormGroup>
            <FormGroup controlId="strength-achievement-repetitions">
                <Col componentClass={ControlLabel} xs={2}>Repetitions</Col>
                <Col xs={10}><Field name="repetitions" component={FieldInput} type="number"/></Col>
            </FormGroup>
            <MediaInput/>
        </Form>
    )
}));