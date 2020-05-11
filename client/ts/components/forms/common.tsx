import * as React from "react";
import Select from 'react-select';
import {connect} from "react-redux";
import {Form as BootstrapForm, Checkbox, FormControl, Radio, Col, FormGroup, ControlLabel} from "react-bootstrap";
import {Form as ReduxForm, Field, reduxForm, formValueSelector} from 'redux-form';
import {IAppState} from "../../state/root";
import {Search} from "../../state/search";
import {IDatedRecord} from "../../models";
import {xdate} from "../../common";

export const dataConnector = connect((s: IAppState, p: { onSubmit?: Function, data?: IDatedRecord }) => {
    let data = p.data || s.root.modal.data || {},
        date = data.date ? xdate(data.date) : s.root.selected_date,
        user = s.root.users[s.root.selected_user_id];
    return {user, initialValues: {...data, date: date.format("YYYY-MM-DD")}, ...p};
});

export class StatefulForm extends React.Component<any, any> {
    onSubmit(e) {
        this.props.onSubmit(this.state);
        e.preventDefault();
    }

    setDate(v) {
        this.setState({date: v});
    }

    setName(v) {
        this.setState({name: v});
    }

    setValue(v) {
        this.setState({value: v});
    }

    setDetails(v) {
        this.setState({details: v});
    }
}

export const FieldInput = ({input, meta, type, placeHolder, ...props}) => {
    return (
        <FormControl
            type={type}
            placeholder={placeHolder}
            defaultValue={meta.initial}
            onChange={input.onChange}
            {...props}
        />
    );
};

export const SearchableSelectInput = ({input, meta, ...props}) => {
    return (
        <Select.AsyncCreatable
            {...input}
            openOnFocus={true}
            ignoreCase={true}
            promptTextCreator={() => input.value}
            options={input.options}
            onBlur={() => input.onBlur(input.value)}
            onChange={props.onChange || input.onChange}
            simpleValue={true}
            value={{label: input.value, value: input.value}}
            backspaceRemoves={true}
            loadOptions={props.loadOptions as any}
        />
    );
};

export const CitySelectInput = (props) => {
    let loadOptions = input => Search.location.city({...props, query: input})
        .then(results => ({options: results}));
    return <SearchableSelectInput {...props} loadOptions={loadOptions}/>;
};

export const StateSelectInput = (props) => {
    let loadOptions = input => Search.location.state({...props, query: input})
        .then(results => ({options: results}));
    return <SearchableSelectInput {...props} loadOptions={loadOptions}/>;
};

export const CountrySelectInput = (props) => {
    let loadOptions = input => Search.location.country({...props, query: input})
        .then(results => ({options: results}));
    return <SearchableSelectInput {...props} loadOptions={loadOptions}/>;
};

export const EnduranceExerciseSelectInput = (props) => {
    let loadOptions = input => Search.exercise.endurance({query: input})
        .then(results => ({options: [{label: input, value: input}, ...results]}));
    return <SearchableSelectInput {...props} loadOptions={loadOptions}/>;
};

export const StrengthExerciseSelectInput = (props) => {
    let loadOptions = input => Search.exercise.strength({query: input})
        .then(results => ({options: results}));
    return <SearchableSelectInput {...props} loadOptions={loadOptions}/>;
};

export const SelectInput = ({input, meta, ...props}) => {
    return (
        <Select
            {...input}
            {...props}
            onBlur={() => input.onBlur(input.value)}
            simpleValue={true}
        />
    );
};

export const RadioInput = ({input, meta, ...props}) => {
    return (
        <Radio {...input} inline={true} {...props}>{props.title || ''}</Radio>
    )
};

export const CheckboxInput = ({input, meta, ...props}) => {
    return (
        <Checkbox {...input} inline={true} {...props}>{props.title || ''}</Checkbox>
    );
};

export const Form = p => (
    <BootstrapForm horizontal formNoValidate noValidate componentClass={ReduxForm} {...p}>
        {p.children}
    </BootstrapForm>
);

export const HeightInputs = () => (
    <FormGroup controlId="height">
        <Col componentClass={ControlLabel} xs={2}>Height</Col>
        <Col xs={5}><Field name="feet" placeholder="feet" step={1} component={FieldInput} type="number"/></Col>
        <Col xs={5}><Field name="inches" placeholder="inches" step={0.1} component={FieldInput} type="number"/></Col>
    </FormGroup>
);

export const WeightInputs = () => (
    <FormGroup controlId="weight">
        <Col componentClass={ControlLabel} xs={2}>Weight</Col>
        <Col xs={10}><Field name="weight" placeholder="pounds" step={0.1} component={FieldInput} type="number"/></Col>
    </FormGroup>
);

export const BirthdayInputs = () => (
    <FormGroup controlId="age">
        <Col componentClass={ControlLabel} xs={2}>Birthday</Col>
        <Col xs={10}><Field name="birthday" placeholder="MM/DD/YYYY" component={FieldInput} type="date"/></Col>
    </FormGroup>
);

export const GenderInputs = ({gender}) => {
    let maleProps = {value: "male", title: "Male", inline: true, checked: false},
        femaleProps = {value: "female", title: "Female", inline: true, checked: false};
    if (gender == "male") maleProps.checked = true;
    else if (gender == "female") femaleProps.checked = true;
    return (
        <FormGroup controlId="gender">
            <Col componentClass={ControlLabel} xs={2}>Gender</Col>
            <Col xs={10}>
                <Field name="gender" component={RadioInput} props={maleProps}/>
                <Field name="gender" component={RadioInput} props={femaleProps}/>
            </Col>
        </FormGroup>
    )
};

export const MediaInput = props => {
    return (
        <FormGroup controlId="media">
            <Col componentClass={ControlLabel} xs={2}>Media</Col>
            <Col xs={10}>
                <Field name="media" placeholder="YouTube, Instagram or image URL" component={FieldInput}/>
            </Col>
        </FormGroup>
    );
};

export const Distance = ({controlId}) => {
    let distanceTypeProps = {
        options: [
            {label: "Miles", value: 1},
            {label: "Kilometers", value: 2},
            {label: "Meters", value: 3},
            {label: "Feet", value: 4},
            {label: "Yards", value: 5},
            {label: "Steps", value: 6}
        ]
    };
    return (
        <FormGroup controlId={controlId}>
            <Col componentClass={ControlLabel} xs={2}>Distance</Col>
            <Col xs={7}><Field name="distance" component={FieldInput} noValidate step={0.1} type="number"/></Col>
            <Col xs={3}>
                <Field name="distance_type_id" component={SelectInput} props={distanceTypeProps}/>
            </Col>
        </FormGroup>
    )
};

export const Time = ({controlId}) => {
    return (
        <FormGroup controlId={controlId}>
            <Col componentClass={ControlLabel} xs={2}>Time</Col>
            <Col xs={3}><Field name="hours" component={FieldInput} step={1} placeholder="Hours"
                               type="number"/></Col>
            <Col xs={3}><Field name="minutes" component={FieldInput} step={1} placeholder="Minutes"
                               type="number"/></Col>
            <Col xs={4}><Field name="seconds" component={FieldInput} step={0.01} placeholder="Seconds"
                               type="number"/></Col>
        </FormGroup>
    )
};

export const Girth = ({controlId}) => {
    let girthLocationProps = {
        options: [
            {label: "Waist", value: "Waist"},
            {label: "Hips", value: "Hips"},
            {label: "Thigh", value: "Thigh"},
            {label: "Arm", value: "Arm"},
            {label: "Chest", value: "Chest"},
            {label: "Neck", value: "Neck"},
            {label: "Calf", value: "Calf"},
            {label: "Forearm", value: "Forearm"},
        ]
    };
    return (
        <FormGroup controlId={controlId}>
            <Col componentClass={ControlLabel} xs={2}>Location</Col>
            <Col xs={10}><Field name="location" component={SelectInput} props={girthLocationProps}/></Col>
        </FormGroup>
    );
};