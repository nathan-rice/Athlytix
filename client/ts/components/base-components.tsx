import * as React from 'react';
import {Actions} from '../state/actions';
import {ControlLabel} from "react-bootstrap";
import Select from 'react-select';
import {Search} from '../state/search';
import {prettyNum, shallowEquality} from "../common";


export const FirstNameSelectInput = props => {
    let loadOptions = input => Search.user.name_.first({...props, query: input})
        .then(results => ({options: results}));
    return <Select.Async {...props} openOnFocus={true} options={[props.value]} loadOptions={loadOptions}/>
};

export const LastNameSelectInput = props => {
    let loadOptions = input => Search.user.name_.last({...props, query: input})
        .then(results => ({options: results}));
    return <Select.Async {...props} openOnFocus={true} options={[props.value]} loadOptions={loadOptions}/>
};

export const GenderSelectInput = props => {
    let options = [{value: "male", label: "Male"}, {value: "female", label: "Female"}],
        clearable = props.clearable || false;
    return <Select openOnFocus={true} {...props} clearable={clearable} options={options}/>
};

export const CitySelectInput = (props) => {
    let loadOptions = input => Search.location.city({...props, query: input})
        .then(results => ({options: results}));
    return <Select.Async {...props} openOnFocus={true} options={[props.value]} loadOptions={loadOptions}/>;
};

export const StateSelectInput = (props) => {
    let loadOptions = input => Search.location.state({...props, query: input})
        .then(results => ({options: results}));
    return <Select.Async {...props} openOnFocus={true} options={[props.value]} loadOptions={loadOptions}/>;
};

export const CountrySelectInput = (props) => {
    let loadOptions = input => Search.location.country({...props, query: input})
        .then(results => ({options: results}));
    return <Select.Async {...props} openOnFocus={true} options={[props.value]} loadOptions={loadOptions}/>;
};

export abstract class Record extends React.Component<any, any> {

    protected abstract attribute: string;

    abstract load();

    constructor(props) {
        super(props);
        this.state = {loadingEstimates: false};
    }

    loadEstimates() {
        this.setState({loadingEstimates: true});
        this.load().then(this.setState({loadingEstimates: false}));
    }

    shouldLoadEstimates(prevProps?) {
        if (this.props.user.id < 1 || !this.props[this.attribute].length || this.state.loadingEstimates) return false;
        if (prevProps) {
            let attrEqual = shallowEquality(prevProps[this.attribute], this.props[this.attribute]);
            return prevProps.user.id != this.props.user.id || !attrEqual
        } else {
            let ak = Object.keys(this.props[this.attribute]),
                estimatesExist = this.props.estimates.days.length > 0;
            return ak.length > 0 && !estimatesExist;
        }
    }

    componentDidMount() {
        if (this.shouldLoadEstimates()) this.loadEstimates();
    }

    componentDidUpdate(prevProps) {
        if (this.shouldLoadEstimates(prevProps)) this.loadEstimates();
    }
}

export abstract class GoalRecord extends Record {

    constructor(props) {
        super(props);
        this.state = {...this.state, loadingGoalEstimates: false};
    }

    loadGoalEstimates() {
        let goals = this.props.goals,
            action = Actions.estimate.goal(Object.keys(goals).map(k => goals[k].id));
        this.setState({loadingGoalEstimates: true});
        return this.props.dispatch(action).then(this.setState({loadingGoalEstimates: false}))
    }

    shouldLoadGoalEstimates(prevProps?) {
        let gk = Object.keys(this.props.goals).sort(),
            ek = Object.keys(this.props.goalEstimates).sort(),
            goalEstimatesExist = gk.length == ek.length && gk.every((e, i) => e == ek[i]);

        // Don't try to load goal estimates until value estimates have been computed
        if (this.props.user.id < 1 || this.state.loadingGoalEstimates || this.state.loadingEstimates || gk.length == 0) {
            return false;
        }
        else if (prevProps) {
            let goalEqual = shallowEquality(prevProps.goals, this.props.goals),
                attrEqual = shallowEquality(prevProps[this.attribute], this.props[this.attribute]);
            return prevProps.user.id != this.props.user.id || !attrEqual || !goalEqual;
        }
        else return !goalEstimatesExist;
    }

    componentDidMount() {
        if (this.shouldLoadEstimates()) this.loadEstimates();
        if (this.shouldLoadGoalEstimates()) this.loadGoalEstimates();
    }

    componentDidUpdate(prevProps) {
        if (this.shouldLoadEstimates(prevProps)) this.loadEstimates();
        if (this.shouldLoadGoalEstimates(prevProps)) this.loadGoalEstimates();
    }
}

export abstract class Percentiles extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {loadingAll: false, loadingCountry: false, loadingState: false, loadingCity: false};
    }

    protected abstract getEstimatorAction(o: any, level: string);
    protected abstract attribute: string;
    protected abstract conditionsChanged(prevProps): boolean;

    loadAll() {
        let a = this.props[this.attribute][0];
        this.setState({loadingAll: true});
        this.props.dispatch(this.getEstimatorAction(a, 'all'))
            .then(this.setState({loadingAll: false}));
    }

    loadCountry() {
        let a = this.props[this.attribute][0];
        this.setState({loadingCountry: true});
        this.props.dispatch(this.getEstimatorAction(a, 'country'))
            .then(this.setState({loadingCountry: false}));
    }

    loadState() {
        let a = this.props[this.attribute][0];
        this.setState({loadingState: true});
        this.props.dispatch(this.getEstimatorAction(a, 'state'))
            .then(this.setState({loadingState: false}));
    }

    loadCity() {
        let a = this.props[this.attribute][0];
        this.setState({loadingCity: true});
        this.props.dispatch(this.getEstimatorAction(a, 'city'))
            .then(this.setState({loadingCity: false}));
    }

    doLoad() {
        if (!this.state.loadingAll) {
            this.loadAll();
        }
        if (!this.state.loadingCountry) {
            this.loadCountry();
        }
        if (!this.state.loadingState) {
            this.loadState();
        }
        if (!this.state.loadingCity) {
            this.loadCity();
        }
    }

    shouldDoLoad(prevProps?) {
        let p = this.props;
        if (p.user.id < 1 || !p[this.attribute].length) return false;
        else if (prevProps) {
            let attributesEqual = shallowEquality(p[this.attribute], prevProps[this.attribute]),
                newConditions = this.conditionsChanged(prevProps);
            if (!newConditions && !attributesEqual) return true;
            else return p.user_id != prevProps.user_id || newConditions
        } else {
            let pt = p.percentiles;
            return !(pt.all >= 0 && pt.country >= 0 && pt.state >= 0 && pt.city >= 0);
        }
    }

    componentDidMount() {
        if (this.shouldDoLoad()) this.doLoad();
    }

    componentDidUpdate(prevProps) {
        if (this.shouldDoLoad(prevProps)) this.doLoad();
    }

    render() {
        let all = prettyNum(this.props.percentiles.all),
            country = prettyNum(this.props.percentiles.country),
            state = prettyNum(this.props.percentiles.state),
            city = prettyNum(this.props.percentiles.city);
        return (
            <div><ControlLabel>Percentile rank</ControlLabel>
                <ul className="list-inline">
                    {all >= 0 && <li>All: {all}%</li>}
                    {country >= 0 && <li>Country: {country}%</li>}
                    {state >= 0 && <li>State: {state}%</li>}
                    {city >= 0 && <li>City: {city}%</li>}
                </ul>
            </div>
        )
    }
}