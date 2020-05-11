import * as React from 'react';
import {Col, Form, ControlLabel, FormGroup, FormControl} from "react-bootstrap";
import Select from 'react-select';
import {dataConnector, StatefulForm} from "./common";
import {Search} from "../../state/search";

export const NameSelectInput = p => {
    let loadOptions = input => Search.calorie.expenditure(p.user.id, {query: input})
            .then(results => ({options: [{label: input, value: input}, ...results]})),
        change = o => {
            let expenditures = Object.keys(p.user.calorie_expenditures).map(k => p.user.calorie_expenditures[k]),
                matches = expenditures.filter(i => i.name == o.value),
                first;
            if (matches.length) {
                first = matches.sort((a, b) => b.id - a.id)[0];
                p.parent.setValue(first.value);
                p.parent.setDetails(first.details);
            }
            p.parent.setName(o.value);
        };
    return <Select.AsyncCreatable {...p} openOnFocus={true} onChange={change} loadOptions={loadOptions}/>;
};

class CalorieExpenditureForm_ extends StatefulForm {

    constructor(props) {
        super(props);
        let {date, name, value, details} = this.props.initialValues;
        this.state = {date, name, value, details};
        if (this.props.initialValues.id) this.state["id"] = this.props.initialValues.id;
    }

    render() {
        let nameValue = {label: this.state.name, value: this.state.name};
        return (
            <Form horizontal id="expenditure" onSubmit={e => this.onSubmit(e)}>
                <div className="page-header-small">
                    <p>You can record exercise performed here.  For strength training workouts, record all exercises
                        performed in the details field.  You can use previous exercise performed as a template rather
                        than having to re-enter everything by selecting its name from the drop-down list.
                    </p>
                </div>
                <FormGroup controlId="date">
                    <Col componentClass={ControlLabel} xs={2}>Date</Col>
                    <Col xs={10}>
                        <FormControl name="date" type="date" value={this.state.date}
                                     onChange={(e: any) => this.setDate(e.target.value)}/>
                    </Col>
                </FormGroup>
                <FormGroup controlId="name">
                    <Col componentClass={ControlLabel} xs={2}>Name</Col>
                    <Col xs={10}>
                        <NameSelectInput value={nameValue} user={this.props.user} parent={this}/>
                    </Col>
                </FormGroup>
                <FormGroup controlId="value">
                    <Col componentClass={ControlLabel} xs={2}>Calories</Col>
                    <Col xs={10}>
                        <FormControl name="value" type="number" value={this.state.value}
                                     onChange={(e: any) => this.setValue(e.target.value)}/>
                    </Col>
                </FormGroup>
                <FormGroup controlId="details">
                    <Col componentClass={ControlLabel} xs={2}>Details</Col>
                    <Col xs={10}>
                        <FormControl name="details" componentClass="textarea" value={this.state.details}
                                     onChange={(e: any) => this.setDetails(e.target.value)}/>
                    </Col>
                </FormGroup>
            </Form>
        );
    }
}

export const CalorieExpenditureForm = dataConnector(CalorieExpenditureForm_);