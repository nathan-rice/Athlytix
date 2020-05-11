import * as React from 'react';
import {
    Col, ControlLabel, DropdownButton, Form, FormControl, FormGroup, InputGroup, MenuItem, Button, Tabs, Tab, Checkbox
} from "react-bootstrap";
import Select from 'react-select';
import * as moment from 'moment';
import {Search} from "../../state/search";
import {FieldInput, dataConnector, SearchableSelectInput, StatefulForm} from "./common";
import {xdate} from "../../common";

export const NameSelectInput = p => {
    let loadOptions = input => Search.calorie.intake(p.user.id, {query: input})
            .then(results => ({options: results})),
        change = o => {
            let v = o && o.value || "",
                intakes = Object.keys(p.user.calorie_intakes).map(k => p.user.calorie_intakes[k]),
                matches = intakes.filter(i => i.name == v),
                first;
            if (matches.length) {
                first = matches.sort((a, b) => b.id - a.id)[0];
                p.parent.setValue(first.value);
                p.parent.setAmount(first.amount);
                p.parent.setProtein(first.protein);
                p.parent.setCarbohydrates(first.carbohydrates);
                p.parent.setFat(first.fat);
                p.parent.setDetails(first.details);
            }
            p.parent.setName(v);
        };
    return <Select.AsyncCreatable {...p} openOnFocus={true} onChange={change} loadOptions={loadOptions}/>;
};

// Switched to stateful component after rage inducing day wasted messing with redux-form
class CalorieIntakeForm_ extends StatefulForm {
    constructor(props) {
        super(props);
        let {date, name, value, amount, protein, carbohydrates, fiber, fat, details} = this.props.initialValues;
        this.state = {date, name, value, amount, protein, carbohydrates, fat, fiber, details, scale: 1};
        if (this.props.initialValues.id) this.state["id"] = this.props.initialValues.id;
    }

    setAmount(v) {
        this.setState({amount: v});
    }

    setProtein(v) {
        this.setState({protein: v});
    }

    setCarbohydrates(v) {
        this.setState({carbohydrates: v});
    }

    setFiber(v) {
        this.setState({fiber: v});
    }

    setFat(v) {
        this.setState({fat: v});
    }

    setScale(v) {
        this.setState({scale: v});
    }

    scaleToAmount(e) {
        let scaleFactor = this.state.scale / this.state.amount;
        this.setState({
            amount: this.state.scale,
            value: this.state.value * scaleFactor,
            protein: this.state.protein * scaleFactor,
            carbohydrates: this.state.carbohydrates * scaleFactor,
            fiber: this.state.fiber * scaleFactor,
            fat: this.state.fat * scaleFactor
        });
        e.preventDefault();
    }

    scaleByFactor(e) {
        let scaleFactor = this.state.scale;
        this.setState({
            amount: this.state.amount * scaleFactor || null,
            value: this.state.value * scaleFactor,
            protein: this.state.protein * scaleFactor,
            carbohydrates: this.state.carbohydrates * scaleFactor,
            fiber: this.state.fiber * scaleFactor,
            fat: this.state.fat * scaleFactor
        });
        e.preventDefault();
    }

    getHeader() {
        return (
            <div className="page-header-small">
                <p>This can be either an individual food item eaten, or the sum total of the entire day's
                    consumption, if you know it and don't care about tracking specific food items.</p>
                <h3>Importing nutrition information from third-party sites</h3>
                <p>If you want to import nutrition information directly from an online database or recipe website,
                    you can install our importer by following the directions <a
                        href="/page/importer.html" target="_blank">here</a>.</p>
            </div>
        );
    }

    getFormFields() {
        let selectValue = {label: this.state.name, value: this.state.name};
        return (
            <div>
                <FormGroup controlId="calorie-intake-date">
                    <Col componentClass={ControlLabel} xs={2}>Date</Col>
                    <Col xs={10}>
                        <FormControl name="date" value={this.state.date} type="date"
                                     onChange={(e: any) => this.setDate(e.target.value)}/>
                    </Col>
                </FormGroup>
                <FormGroup controlId="calorie-intake-name">
                    <Col componentClass={ControlLabel} xs={2}>Name</Col>
                    <Col xs={10}>
                        <NameSelectInput value={selectValue} user={this.props.user} parent={this}/>
                    </Col>
                </FormGroup>
                <FormGroup controlId="calorie-intake-value">
                    <Col componentClass={ControlLabel} xs={2}>Amount</Col>
                    <Col xs={3}>
                        <FormControl name="value" type="number" placeholder="Grams" value={this.state.amount}
                                     onChange={(e: any) => this.setAmount(e.target.value)}/>
                    </Col>
                    <Col componentClass={ControlLabel} xs={3}>Scale Nutrition</Col>
                    <Col xs={4}>
                        <InputGroup>
                            <FormControl type="number" value={this.state.scale}
                                         onChange={(e: any) => this.setScale(e.target.value)}/>
                            <DropdownButton id="scale-dropdown" componentClass={InputGroup.Button}
                                            title="Scale">
                                <MenuItem key="1" disabled={!(this.state.amount > 0)}
                                          onClick={e => this.scaleToAmount(e)}>
                                    Adjust nutrition for {this.state.scale} grams
                                </MenuItem>
                                <MenuItem key="2" onClick={e => this.scaleByFactor(e)}>
                                    Multiply by nutrition by {this.state.scale}
                                </MenuItem>
                            </DropdownButton>
                        </InputGroup>
                    </Col>
                </FormGroup>
                <FormGroup controlId="calorie-intake-value">
                    <Col componentClass={ControlLabel} xs={2}>Calories</Col>
                    <Col xs={10}>
                        <FormControl name="value" type="number" value={this.state.value} step={0.1}
                                     onChange={(e: any) => this.setValue(e.target.value)}/>
                    </Col>
                </FormGroup>
                <FormGroup controlId="calorie-intake-protein-grams">
                    <Col componentClass={ControlLabel} xs={2}>Protein</Col>
                    <Col xs={10}>
                        <FormControl name="protein" placeholder="Grams" value={this.state.protein} type="number"
                                     step={0.1} onChange={(e: any) => this.setProtein(e.target.value)}/>
                    </Col>
                </FormGroup>
                <FormGroup controlId="calorie-intake-carbohydrates-grams">
                    <Col componentClass={ControlLabel} xs={2}>Carbs</Col>
                    <Col xs={10}>
                        <FormControl name="carbohydrates" placeholder="Grams" type="number"
                                     value={this.state.carbohydrates} step={0.1}
                                     onChange={(e: any) => this.setCarbohydrates(e.target.value)}/>
                    </Col>
                </FormGroup>
                <FormGroup controlId="calorie-intake-fiber-grams">
                    <Col componentClass={ControlLabel} xs={2}>Fiber</Col>
                    <Col xs={10}>
                        <FormControl name="fiber" placeholder="Grams" type="number"
                                     value={this.state.fiber} step={0.1}
                                     onChange={(e: any) => this.setFiber(e.target.value)}/>
                    </Col>
                </FormGroup>
                <FormGroup controlId="calorie-intake-fat-grams">
                    <Col componentClass={ControlLabel} xs={2}>Fat</Col>
                    <Col xs={10}>
                        <FormControl name="fat" placeholder="Grams" type="number" value={this.state.fat} step={0.1}
                                     onChange={(e: any) => this.setFat(e.target.value)}/>
                    </Col>
                </FormGroup>
                <FormGroup controlId="calorie-intake-details">
                    <Col componentClass={ControlLabel} xs={2}>Details</Col>
                    <Col xs={10}>
                        <FormControl name="details" componentClass="textarea" value={this.state.details}
                                     onChange={(e: any) => this.setDetails(e.target.value)}/>
                    </Col>
                </FormGroup>
            </div>
        );
    }

    render() {
        return (
            <Form horizontal id="intake" onSubmit={e => this.onSubmit(e)}>
                {this.getHeader()}
                {this.getFormFields()}
            </Form>
        )
    }
}

export const CalorieIntakeForm = dataConnector(CalorieIntakeForm_);

const DateSelectInput = props => {
    let u = props.user,
        dates = {},
        options,
        onChange,
        value = props.value ? {label: props.value.format("MM/DD/YYYY"), value: props.value.valueOf()} : null;
    Object.keys(u.calorie_intakes).map(k => u.calorie_intakes[k]).forEach(i => {
        let d = i.date.valueOf();
        if (!dates[d]) dates[d] = [];
        dates[d].push(i);
    });
    options = Object.keys(dates).map(k => ({label: moment.utc(parseInt(k)).format("MM/DD/YYYY"), value: k}));
    onChange = o => {
        props.parent.setState({intakes: dates[o.value], groupDate: xdate(parseInt(o.value))});
    };
    return <Select options={options} value={value} openOnFocus={true} onChange={onChange}/>;
};

const FoodSelectInput = props => {
    let u = props.user,
        ci = u.calorie_intakes,
        intakeToOption = i => ({label: i.name, value: i.id, intake: i}),
        options,
        value,
        onChange,
        date = props.parent.state.groupDate ? props.parent.state.groupDate.valueOf() : 0;

    options = Object.keys(ci)
        .map(k => intakeToOption(ci[k]))
        .filter(o => o.intake.date.valueOf() == date);

    value = props.value.map(i => intakeToOption(i));

    onChange = o => props.parent.setState({intakes: o.map(o => o.intake)});

    return <Select multi options={options} value={value} onChange={onChange}/>;
};

class TabCalorieIntakeForm_ extends CalorieIntakeForm_ {
    constructor(props) {
        super(props);
        this.state = {...this.state, activeTab: 1, groupIntakes: false, intakes: [], groupName: ""};
    }

    onSelect(k) {
        this.setState({activeTab: k});
    }

    setGroupIntakes(v) {
        this.setState({groupIntakes: v})
    }

    setGroupName(v) {
        this.setState({groupName: v});
    }

    render() {
        return (
            <Form horizontal id="intake" onSubmit={e => this.onSubmit(e)}>
                {this.getHeader()}
                <Tabs activeKey={this.state.activeTab} onSelect={e => this.onSelect(e)} id="intake-tabs">
                    <Tab eventKey={1} title="Single Item">
                        {this.getFormFields()}
                    </Tab>
                    <Tab eventKey={2} title="Create Meal/Copy multiple">
                        <FormGroup controlId="calorie-intake-date">
                            <Col componentClass={ControlLabel} xs={2}>Date</Col>
                            <Col xs={10}>
                                <FormControl name="date" value={this.state.date} type="date"
                                             onChange={(e: any) => this.setDate(e.target.value)}/>
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="calorie-intake-copy-date">
                            <Col componentClass={ControlLabel} xs={2}>Copy date</Col>
                            <Col xs={10}>
                                <DateSelectInput user={this.props.user} value={this.state.groupDate} parent={this}/>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col xs={2}/>
                            <Col xs={10}>
                                <Checkbox onChange={(e: any) => this.setGroupIntakes(e.target.value)}>
                                    Group foods items into a meal
                                </Checkbox>
                            </Col>
                        </FormGroup>
                        {this.state.groupIntakes &&
                        <FormGroup controlId="calorie-intake-copy-name">
                            <Col componentClass={ControlLabel} xs={2}>Meal name</Col>
                            <Col xs={10}>
                                <FormControl placeholder="Entry name" value={this.state.groupName}
                                             onChange={(e: any) => this.setGroupName(e.target.value)}/>
                            </Col>
                        </FormGroup>}
                        <FormGroup>
                        <Col componentClass={ControlLabel} xs={2}>Copy items</Col>
                        <Col xs={10}>
                            <FoodSelectInput user={this.props.user} value={this.state.intakes} parent={this}/>
                        </Col>
                        </FormGroup>
                    </Tab>
                </Tabs>
            </Form>
        );
    }
}

export const TabCalorieIntakeForm = dataConnector(TabCalorieIntakeForm_);