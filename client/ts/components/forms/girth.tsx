import * as React from 'react';
import * as moment from 'moment';
import {connect} from 'react-redux';
import {reduxForm, Field, formValueSelector} from 'redux-form';
import {Col, ControlLabel, FormGroup} from "react-bootstrap";
import {FieldInput, Form, Girth, SelectInput} from "./common";
import {IGirthMeasurement} from "../../models";
import {xdate} from "../../common";

const girthSelector = formValueSelector('girth_measurement');
const girthConnector = connect((state, props: { onSubmit?: Function, data?: IGirthMeasurement }) => {
    let d = props.data,
        date = (d.date ? xdate(d.date) : state.root.selected_date).format("YYYY-MM-DD"),
        locationSel = girthSelector(state, 'location'),
        location = locationSel && locationSel.value || d.location || "waist";
    return {
        ...props,
        initialValues: {...d, location, date}
    }
});

export const GirthMeasurementForm = girthConnector(reduxForm({form: "girth_measurement"})(props => {
    let {handleSubmit, onSubmit} = props;
    return (
        <Form id="girth-measurement" onSubmit={handleSubmit(onSubmit || console.log)}>
            <div className="page-header-small">
                <p>Whether you are trying to build muscle or lose fat, recording your body measurements is an important
                    step in accurately assessing your progress. We suggest recording your arm, chest, thigh and waist
                    measurements at least once a month.
                </p>
            </div>
            <FormGroup controlId="girth-measurement-date">
                <Col componentClass={ControlLabel} xs={2}>Date</Col>
                <Col xs={10}><Field name="date" component={FieldInput} type="date"/></Col>
            </FormGroup>
            <Girth controlId="girth-measurement-location"/>
            <FormGroup controlId="girth-measurement-value">
                <Col componentClass={ControlLabel} xs={2}>Value</Col>
                <Col xs={10}><Field name="value" component={FieldInput} step={0.125} noValidate type="number"/></Col>
            </FormGroup>
        </Form>
    );
}));