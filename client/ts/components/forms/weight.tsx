import * as React from 'react';
import {reduxForm, Field} from 'redux-form';
import {Col, ControlLabel, FormGroup} from "react-bootstrap";
import {FieldInput, Form, dataConnector, MediaInput} from "./common";

export const WeightMeasurementForm = dataConnector(reduxForm({form: "weight_measurement"})(props => {
    let {onSubmit, handleSubmit} = props;
    return (
        <Form id="weight-measurement" onSubmit={handleSubmit(onSubmit || console.log)}>
            <FormGroup controlId="weight-measurement-date">
                <Col componentClass={ControlLabel} xs={2}>Date</Col>
                <Col xs={10}><Field name="date" component={FieldInput} type="date"/></Col>
            </FormGroup>
            <FormGroup controlId="weight-measurement-value">
                <Col componentClass={ControlLabel} xs={2}>Weight</Col>
                <Col xs={10}><Field name="value" component={FieldInput} props={{step: 0.1}} type="number"/></Col>
            </FormGroup>
            <MediaInput/>
        </Form>
    );
}));