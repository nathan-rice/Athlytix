import * as React from 'react';
import {connect} from 'react-redux';
import {reduxForm, Field, formValueSelector} from 'redux-form';
import * as moment from 'moment';
import {IBodyfatMeasurement, User} from "../../models";
import {Col, ControlLabel, FormGroup} from "react-bootstrap";
import {
    FieldInput,
    Form,
    GenderInputs,
    HeightInputs,
    WeightInputs,
    SelectInput,
    BirthdayInputs,
    MediaInput
} from "./common";

interface IBodyfatMeasurementFormProps {
    data: IBodyfatMeasurement;
    initialValues: IBodyfatMeasurement & { gender, birthday };
    measurement_type_id?: number;
    gender?: string | boolean;
    user: User;
    onSubmit: Function,
    handleSubmit: Function,
}

const bodyfatSelector = formValueSelector('bodyfat_measurement');

const bodyfatConnector = connect((state, props: { onSubmit?: Function, data?: IBodyfatMeasurement }) => {
    let r = state.root,
        d = props.data,
        user_id = r.selected_user_id || r.user_id,
        u = r.users[user_id],
        date = d.date || state.selected_date,
        measurement_type_id = bodyfatSelector(state, 'measurement_type_id') || d.measurement_type_id || 1,
        gender = bodyfatSelector(state, 'gender') || u.gender,
        birthday = bodyfatSelector(state, 'birthday') || u.birthday;
    return {
        ...props,
        initialValues: {user_id, ...d, birthday, measurement_type_id, date: date.format("YYYY-MM-DD")},
        user: u,
        gender,
        measurement_type_id
    }
});

export const BodyfatMeasurementForm = bodyfatConnector(reduxForm({form: "bodyfat_measurement"})(props => {
    let {initialValues, gender, measurement_type_id, handleSubmit, onSubmit, user}: IBodyfatMeasurementFormProps = props,
        measurementInputs,
        measurementTypeProps = {
            options: [
                {label: "Navy Estimator", value: 1},
                {label: "Bioelectric Impedance", value: 2},
                {label: "Caliper (3 site)", value: 3},
                {label: "DXA", value: 4},
                {label: "Bod Pod", value: 5},
                {label: "Hydrostatic Weighing", value: 6}
            ]
        };
    if (measurement_type_id == 1) {
        measurementInputs = (
            <NavyEstimatorInputs
                user={user}
                height={user.height}
                weight={user.lastWeight()}
                gender={gender}
                value={initialValues.value}/>
        );
    }

    else if (measurement_type_id == 3) {
        let time = moment_ => moment_.toDate().getTime(),
            years = (birthday) => moment.duration(time(moment()) - time(birthday), 'milliseconds').years(),
            age = initialValues.birthday && years(initialValues.birthday);
        measurementInputs = (
            <CaliperEstimatorInputs
                user={user}
                age={age}
                gender={gender}
                value={initialValues.value}/>
        );
    }

    else {
        measurementInputs = (
            <FormGroup controlId="bodyfat-measurement-amount">
                <Col componentClass={ControlLabel} xs={2}>Bodyfat %</Col>
                <Col xs={10}><Field name="value" component={FieldInput} type="number"/></Col>
            </FormGroup>
        );
    }

    return (
        <Form id="bodyfat-measurement" onSubmit={handleSubmit(onSubmit || console.log)}>
            <FormGroup controlId="bodyfat-measurement-date">
                <Col componentClass={ControlLabel} xs={2}>Date</Col>
                <Col xs={10}><Field name="date" component={FieldInput} type="date"/></Col>
            </FormGroup>
            <FormGroup controlId="bodyfat-measurement-type">
                <Col componentClass={ControlLabel} xs={2}>Measurement type</Col>
                <Col xs={10}><Field name="measurement_type_id" component={SelectInput}
                                    props={measurementTypeProps}/></Col>
            </FormGroup>
            {measurementInputs}
            <MediaInput/>
        </Form>
    );
}));

const maleNavyMeasurementInputs = [
    <FormGroup key="1" controlId="waist-measurement">
        <Col componentClass={ControlLabel} xs={2}>Waist (navel)</Col>
        <Col xs={10}><Field name="waist" placeholder="inches" step={0.125} component={FieldInput} type="number"/></Col>
    </FormGroup>
];

const femaleNavyMeasurementInputs = [
    <FormGroup key="1" controlId="waist-measurement">
        <Col componentClass={ControlLabel} xs={2}>Waist (narrowest)</Col>
        <Col xs={10}><Field name="waist" placeholder="inches" step={0.125} component={FieldInput} type="number"/></Col>
    </FormGroup>,
    <FormGroup key="2" controlId="hip-measurement">
        <Col componentClass={ControlLabel} xs={2}>Hips</Col>
        <Col xs={10}><Field name="hips" placeholder="inches" step={0.125} component={FieldInput} type="number"/></Col>
    </FormGroup>
];

const NavyEstimatorInputs = props => {
    let {user, gender, height, weight} = props;
    return (
        <div>
            {!height && <HeightInputs/>}
            {!weight && <WeightInputs/>}
            {user.gender === undefined && <GenderInputs gender={gender}/>}
            {props.value &&
            <FormGroup controlId="value">
                <Col componentClass={ControlLabel} xs={2}>Bodyfat %</Col>
                <Col xs={10}>
                    <Field name="value" placeholder="percent" component={FieldInput} step={0.1} noValidate
                           type="number"/>
                </Col>
            </FormGroup>}
            {!props.value &&
            <Col xs={12}>
                <div className="page-header-small text-muted">Measurements</div>
            </Col>}
            {!props.value &&
            <FormGroup controlId="neck-measurement">
                <Col componentClass={ControlLabel} xs={2}>Neck</Col>
                <Col xs={10}>
                    <Field name="neck" placeholder="inches" step={0.125} component={FieldInput}
                           type="number"/>
                </Col>
            </FormGroup>}
            {!props.value &&
            (user.gender == "male" && maleNavyMeasurementInputs || user.gender == "female" && femaleNavyMeasurementInputs)}
        </div>
    );
};

const maleCaliperInputs = [
    <FormGroup key="2" controlId="pectoral-fold-measurement">
        <Col componentClass={ControlLabel} xs={2}>Pectoral</Col>
        <Col xs={10}>
            <Field name="pectoral" placeholder="millimeters" step={0.5} noValidate component={FieldInput}
                   type="number"/>
        </Col>
    </FormGroup>,
    <FormGroup key="3" controlId="abdominal-fold-measurement">
        <Col componentClass={ControlLabel} xs={2}>Abdominal</Col>
        <Col xs={10}>
            <Field name="abdominal" placeholder="millimeters" step={0.5} noValidate component={FieldInput}
                   type="number"/>
        </Col>
    </FormGroup>
];

const femaleCaliperInputs = [
    <FormGroup key="2" controlId="triceps-fold-measurement">
        <Col componentClass={ControlLabel} xs={2}>Triceps</Col>
        <Col xs={10}>
            <Field name="triceps" placeholder="millimeters" step={0.5} noValidate component={FieldInput} type="number"/>
        </Col>
    </FormGroup>,
    <FormGroup key="3" controlId="suprailiac-fold-measurement">
        <Col componentClass={ControlLabel} xs={2}>Suprailiac</Col>
        <Col xs={10}>
            <Field name="suprailiac" placeholder="millimeters" step={0.5} noValidate component={FieldInput}
                   type="number"/>
        </Col>
    </FormGroup>
];

const CaliperEstimatorInputs = props => {
    let {age, gender, user} = props;
    return (
        <div>
            {user.gender === undefined && <GenderInputs gender={gender}/>}
            {!age && <BirthdayInputs/>}
            {props.value &&
            <FormGroup controlId="value">
                <Col componentClass={ControlLabel} xs={2}>Bodyfat %</Col>
                <Col xs={10}>
                    <Field name="value" placeholder="percent" component={FieldInput} step={0.1} type="number"/>
                </Col>
            </FormGroup>}
            {!props.value &&
            <Col xs={12}>
                <div className="page-header-small text-muted">Skin Folds</div>
            </Col>}
            {!props.value && (user.gender == "male" && maleCaliperInputs || user.gender == "female" && femaleCaliperInputs)}
            {!props.value &&
            <FormGroup controlId="thigh-fold-measurement">
                <Col componentClass={ControlLabel} xs={2}>Thigh</Col>
                <Col xs={10}>
                    <Field name="thigh" placeholder="millimeters" step={0.5} noValidate component={FieldInput}
                           type="number"/>
                </Col>
            </FormGroup>}
        </div>
    );
};