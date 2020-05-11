import * as React from 'react';
import {connect} from 'react-redux';
import {reduxForm, Field} from 'redux-form';
import {Col, ControlLabel, FormGroup} from "react-bootstrap";
import {FieldInput, Form} from "./common";
import {IAppState} from "../../state/root";
import {xdate} from "../../common";
import {IDietPeriod} from "../../models";

export const dietPeriodConnector = connect((s: IAppState, p: { onSubmit?: Function, data?: any}) => {
    let data = p.data || s.root.modal.data || {},
        user = s.root.users[s.root.selected_user_id],
        initialValues: IDietPeriod = {...data};
    if (data.start_date) initialValues.start_date = xdate(data.start_date).format("YYYY-MM-DD");
    if (data.end_date) initialValues.end_date = xdate(data.end_date).format("YYYY-MM-DD");
    if (data.example_date) initialValues.example_date = xdate(data.example_date).format("YYYY-MM-DD");
    return {user, initialValues, ...p};
});

export const DietPeriodForm = dietPeriodConnector(reduxForm({form: "diet_period"})(props => {
    let {onSubmit, handleSubmit} = props;
    return (
        <Form id="diet-period" onSubmit={handleSubmit(onSubmit || console.log)}>
            <div className="page-header-small">
            <p>If you tend to eat roughly the same food most days, diet periods allow you to enter it once rather than
                having to re-enter it every day. Once you have a diet period configured, if you don't log any food eaten
                for a given day, Athlytix will automatically use the default day of the current diet period to
                determine your intake.</p>
            </div>
            <FormGroup controlId="diet-period-name">
                <Col componentClass={ControlLabel} xs={3}>Name</Col>
                <Col xs={9}><Field name="name" component={FieldInput} type="text"/></Col>
            </FormGroup>
            <FormGroup controlId="diet-period-start-date">
                <Col componentClass={ControlLabel} xs={3}>Start Date</Col>
                <Col xs={9}><Field name="start_date" component={FieldInput} type="date"/></Col>
            </FormGroup>
            <FormGroup controlId="diet-period-end-date">
                <Col componentClass={ControlLabel} xs={3}>End Date</Col>
                <Col xs={9}><Field name="end_date" component={FieldInput} type="date"/></Col>
            </FormGroup>
            <FormGroup controlId="diet-period-example-date">
                <Col componentClass={ControlLabel} xs={3}>Default Date</Col>
                <Col xs={9}><Field name="example_date" component={FieldInput} type="date"/></Col>
            </FormGroup>
            <FormGroup controlId="diet-period-calories">
                <Col componentClass={ControlLabel} xs={3}>Minimum Calories</Col>
                <Col xs={3}>
                    <Field name="min_calories" component={FieldInput} type="number"/>
                </Col>
                <Col componentClass={ControlLabel} xs={3}>Maximum Calories</Col>
                <Col xs={3}>
                    <Field name="max_calories" component={FieldInput} type="number"/>
                </Col>
            </FormGroup>
            <FormGroup controlId="diet-period-protein">
                <Col componentClass={ControlLabel} xs={3}>Minimum Protein</Col>
                <Col xs={3}>
                    <Field name="min_protein" component={FieldInput} type="number"/>
                </Col>
                <Col componentClass={ControlLabel} xs={3}>Maximum Protein</Col>
                <Col xs={3}>
                    <Field name="max_protein" component={FieldInput} type="number"/>
                </Col>
            </FormGroup>
            <FormGroup controlId="diet-period-carbohydrates">
                <Col componentClass={ControlLabel} xs={3}>Minimum Carbohydrates</Col>
                <Col xs={3}>
                    <Field name="min_carbohydrates" component={FieldInput} type="number"/>
                </Col>
                <Col componentClass={ControlLabel} xs={3}>Maximum Carbohydrates</Col>
                <Col xs={3}>
                    <Field name="max_carbohydrates" component={FieldInput} type="number"/>
                </Col>
            </FormGroup>
            <FormGroup controlId="diet-period-fiber">
                <Col componentClass={ControlLabel} xs={3}>Minimum Fiber</Col>
                <Col xs={3}>
                    <Field name="min_fiber" component={FieldInput} type="number"/>
                </Col>
                <Col componentClass={ControlLabel} xs={3}>Maximum Fiber</Col>
                <Col xs={3}>
                    <Field name="max_fiber" component={FieldInput} type="number"/>
                </Col>
            </FormGroup>
            <FormGroup controlId="diet-period-fat">
                <Col componentClass={ControlLabel} xs={3}>Minimum Fat</Col>
                <Col xs={3}>
                    <Field name="min_fat" component={FieldInput} type="number"/>
                </Col>
                <Col componentClass={ControlLabel} xs={3}>Maximum Fat</Col>
                <Col xs={3}>
                    <Field name="max_fat" component={FieldInput} type="number"/>
                </Col>
            </FormGroup>
            <FormGroup controlId="details">
                <Col componentClass={ControlLabel} xs={3}>Details</Col>
                <Col xs={9}>
                    <Field name="details" component={FieldInput} props={{componentClass: "textarea"}}/>
                </Col>
            </FormGroup>
        </Form>
    );
}));