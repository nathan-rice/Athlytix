import * as React from 'react';
import {connect} from 'react-redux';
import {FormGroup, ControlLabel, Col} from 'react-bootstrap';
import {Field, reduxForm, formValueSelector} from 'redux-form';
import {IUser, User} from '../../models';
import {
    FieldInput, Form, RadioInput, CheckboxInput, CitySelectInput, StateSelectInput,
    CountrySelectInput, HeightInputs
} from "./common";

const userConnector = connect((s, p: { user: User, onSubmit }) => {
    let u = p.user,
        t = s.root.users[s.root.user_id],
        city = t.city,
        state = t.state,
        country = t.country,
        initialValues: IUser | User = {city, state, country, ...u};
    if (u.birthday) initialValues.birthday = u.birthday.format("YYYY-MM-DD");
    return {...p, initialValues};
});

export const UserForm = userConnector(reduxForm({form: "account_form"})(props => {
    let {handleSubmit, onSubmit, initialValues} = props,
        maleProps = {value: "male", title: "Male"},
        femaleProps = {value: "female", title: "Female"},
        trainerProps = {title: "Personal trainer"},
        publicProps = {title: "Public profile"};
    return (
        <Form id="account_form" onSubmit={handleSubmit(onSubmit || console.log)}>
            <FormGroup controlId="first_name">
                <Col componentClass={ControlLabel} xs={2}>First name</Col>
                <Col xs={10}><Field name="first_name" component={FieldInput} type="text"/></Col>
            </FormGroup>
            <FormGroup controlId="last_name">
                <Col componentClass={ControlLabel} xs={2}>Last name</Col>
                <Col xs={10}><Field name="last_name" component={FieldInput} type="text"/></Col>
            </FormGroup>
            <FormGroup controlId="email">
                <Col componentClass={ControlLabel} xs={2}>E-mail</Col>
                <Col xs={10}><Field name="email" component={FieldInput} type="text"/></Col>
            </FormGroup>
            <FormGroup controlId="gender">
                <Col componentClass={ControlLabel} xs={2}>Gender</Col>
                <Col xs={10}>
                    <Field name="gender" component={RadioInput} props={maleProps}
                           defaultChecked={initialValues.gender == "male"}/>
                    <Field name="gender" component={RadioInput} props={femaleProps}
                           defaultChecked={initialValues.gender == "female"}/>
                </Col>
            </FormGroup>
            <FormGroup controlId="birthday">
                <Col componentClass={ControlLabel} xs={2}>Birthday</Col>
                <Col xs={10}><Field name="birthday" component={FieldInput} type="date"/></Col>
            </FormGroup>
            <HeightInputs/>
            <FormGroup controlId="is_trainer">
                <Col componentClass={ControlLabel} xs={2}/>
                <Col xs={10}>
                    <Field name="is_trainer" component={CheckboxInput} props={trainerProps}
                           defaultChecked={initialValues.is_trainer}/>
                </Col>
            </FormGroup>
            <FormGroup controlId="is_public">
                <Col componentClass={ControlLabel} xs={2}/>
                <Col xs={10}>
                    <Field name="is_public" component={CheckboxInput} props={publicProps}
                           defaultChecked={initialValues.is_public}/>
                </Col>
            </FormGroup>
            <FormGroup controlId="city">
                <Col componentClass={ControlLabel} xs={2}>City</Col>
                <Col xs={10}><Field name="city" component={CitySelectInput}/></Col>
            </FormGroup>
            <FormGroup controlId="state">
                <Col componentClass={ControlLabel} xs={2}>State/Province</Col>
                <Col xs={10}><Field name="state" component={StateSelectInput}/></Col>
            </FormGroup>
            <FormGroup controlId="country">
                <Col componentClass={ControlLabel} xs={2}>Country</Col>
                <Col xs={10}><Field name="country" component={CountrySelectInput}/></Col>
            </FormGroup>
            <FormGroup controlId="instagram">
                <Col componentClass={ControlLabel} xs={2}>Instagram Name</Col>
                <Col xs={10}><Field name="instagram" type="text" component={FieldInput}/></Col>
            </FormGroup>
            <FormGroup controlId="twitter">
                <Col componentClass={ControlLabel} xs={2}>Twitter Handle</Col>
                <Col xs={10}><Field name="twitter" type="text" component={FieldInput}/></Col>
            </FormGroup>
            <FormGroup controlId="youtube">
                <Col componentClass={ControlLabel} xs={2}>Youtube Channel</Col>
                <Col xs={10}><Field name="youtube" type="text" component={FieldInput}/></Col>
            </FormGroup>
            <FormGroup controlId="about">
                <Col componentClass={ControlLabel} xs={2}>About</Col>
                <Col xs={10}><Field name="about" component={FieldInput} props={{componentClass: "textarea"}}/></Col>
            </FormGroup>
        </Form>
    );
}));