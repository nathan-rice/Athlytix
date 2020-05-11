import * as React from 'react';
import * as moment from 'moment';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {
    Col, ControlLabel, Form, FormControl, FormGroup, Row, Button, Glyphicon, Alert,
    ButtonGroup, Grid
} from 'react-bootstrap';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import Select from 'react-select';
import * as  regression from 'regression';
import {EstimatorPlot} from '../../plots/estimator';
import {RepsPlot} from '../../plots/repetitions';
import {WeightPlot} from '../../plots/weight';
import {Actions} from "../../../state/actions";
import {IAppState} from "../../../state/root";
import {IGoal} from "../../../models";
import {GoalRecord, Percentiles} from "../../base-components";
import {Set, Array} from 'es6-shim';
import {prettyNum} from "../../../common";

interface IAchievementProps {
    match?: { params?: { distance_type_id?: number, exercise?: string, user_id?: string, fixed?: string, value?: number } }
}

const StrengthBanner = (props: any) => {
    let u = props.user,
        a = u.strength_achievements,
        exercise = props.match.params.exercise,
        exercises = new Set(Object.keys(a).map(k => a[k].exercise)),
        exerciseNames = Array.from(exercises.keys()).sort().map(k => ({label: k, value: k})),
        change = v => {
            let exercise = encodeURIComponent(v.label);
            return props.history.push(`/achievement/strength/${u.id}/${exercise}/`);
        },
        url = `/leaderboard/strength/${exercise}/${u.gender}/`;
    return (
        <div className="banner">
            <Row>
                <div className="banner-selector form-horizontal">
                    <Col componentClass={ControlLabel} sm={1}>Exercise:</Col>
                    <Col sm={3}>
                        <Select openOnFocus={true} value={exercise} clearable={false} options={exerciseNames}
                                onChange={change}/>
                    </Col>
                </div>
                <Col sm={3}>
                    <div className="achievement-banner-leaderboard">
                        <ControlLabel>Leaderboard</ControlLabel>
                        <ul className="list-inline">
                            <li><Link to={url}>All</Link></li>
                            {u.country &&
                            <li><Link to={url + `${u.country}/`}>Country</Link></li>}
                            {u.country && u.state &&
                            <li><Link to={url + `${u.country}/${u.state}/`}>State</Link></li>}
                            {u.country && u.state && u.city &&
                            <li><Link to={url + `${u.country}/${u.state}/${u.city}/`}>City</Link></li>}
                        </ul>
                    </div>
                </Col>
                <Col sm={4}>
                    <StrengthPercentiles {...props}/>
                </Col>
            </Row>
        </div>
    );
};

const predict = (a, k) => {
    let minDay = Math.min(...a.map(a => a.date.valueOf())),
        data = a.map(a => [moment.duration(a.date.valueOf() - minDay).asDays(), a[k]]),
        model = regression.linear(data);
    return model.predict(moment.duration(moment().valueOf() - minDay).asDays())[1];
};

class EstimateRepsAtWeight extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {weight: 0}
    }

    render() {
        let {max, error, achievements} = this.props,
            weight = this.state.weight,
            props,
            change = e => this.setState({weight: parseFloat(e.target.value)});
        if (weight === 0) {
            let prediction = predict(achievements, "weight");
            weight = Math.round(prediction / 5) * 5;
        }
        props = {weight, max, error};
        return (
            <div className="plot-control-widget">
                <Form inline>
                    <FormGroup controlId="rep-estimator-weight">
                        <ControlLabel>Reps for weight:</ControlLabel>{' '}
                        <FormControl type="number" noValidate value={weight} step={5} placeholder="pounds"
                                     onChange={change}/>
                    </FormGroup>
                </Form>
                <RepsPlot {...props}/>
            </div>
        );
    }
}

class EstimateWeightForReps extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {reps: 0};
    }

    render() {
        let {achievements, max, error} = this.props,
            reps = this.state.reps,
            props,
            change = e => this.setState({reps: parseInt(e.target.value)});
        if (reps === 0) {
            let prediction = predict(achievements, "repetitions");
            reps = Math.round(prediction);
        }
        props = {reps, max, error};
        return (
            <div className="plot-control-widget">
                <Form inline>
                    <FormGroup controlId="weight-estimator-reps">
                        <ControlLabel>Weight for reps:</ControlLabel>{' '}
                        <FormControl type="number" noValidate value={reps} step={1} placeholder="repetitions"
                                     onChange={change}/>
                    </FormGroup>
                </Form>
                <WeightPlot {...props}/>
            </div>
        );
    }
}

const estimateForDay = (e, d) => {
    for (let i = 0; i < e.days.length; i++) {
        if (d.dayOfYear() == e.days[i].dayOfYear() && d.year() == e.days[i].year()) {
            return e.means[i];
        }
    }
};

class EstimatePercentage extends React.Component<any, any> {
    constructor() {
        super();
        this.state = {percentage: 0}
    }

    render() {
        let {achievements, estimates, max, error} = this.props,
            percentage = this.state.percentage,
            weight, props,
            currentEstimate = estimateForDay(estimates, moment()),
            change = e => this.setState({percentage: parseInt(e.target.value)});
        if (percentage === 0) {
            let minDay = Math.min(...achievements.map(a => a.date.valueOf())),
                mapFunction = a => [
                    moment.duration(a.date.valueOf() - minDay).asDays(),
                    a.weight / estimateForDay(estimates, a.date) * 100
                ],
                data = achievements.map(mapFunction),
                model = regression.linear(data),
                prediction = model.predict(moment.duration(moment().valueOf() - minDay).asDays())[1];

            weight = Math.round(currentEstimate * prediction / 500) * 5;
            // Now reset percentage to nearest 5lb increment
            percentage = Math.round(weight / currentEstimate * 100);
        } else weight = currentEstimate * percentage / 100;
        props = {weight, max, error};
        return (
            <div className="plot-control-widget">
                <Form inline>
                    <FormGroup controlId="rep-estimator-percentage">
                        <ControlLabel>Reps for %1RM:</ControlLabel>{' '}
                        <FormControl type="number" noValidate value={percentage} step={1} placeholder="percent"
                                     onChange={change}/>
                    </FormGroup>
                </Form>
                <RepsPlot {...props}/>
            </div>
        );
    }
}

const StrengthAchievementGraphs = (props) => {
    let a = props.achievements,
        x = a.map(e => new Date(e.date.format("YYYY/MM/DD"))),
        y = a.map(e => e.weight * (1 + e.repetitions / 30)),
        text = a.map(a => `1RM estimate, ${a.weight} × ${a.repetitions}`);
    return (
        <div className="plot-container">
            <EstimatorPlot {...props} x={x} y={y} text={text} showPeak yLabel="Weight (Pounds)"
                           name="1 rep max"/>
            <Row>
                <Col sm={4}><EstimateRepsAtWeight {...props}/></Col>
                <Col sm={4}><EstimatePercentage {...props}/></Col>
                <Col sm={4}><EstimateWeightForReps {...props}/></Col>
            </Row>
        </div>
    )
};

const StrengthGoalAlert = ({goal, probability, dispatch}) => {
    let p = prettyNum(probability * 100),
        bsStyle = p >= 75 ? "success" : p < 25 ? "danger" : "warning",
        date = goal.date.format("LL"),
        goalText = `${goal.value} × ${goal.parameters.repetitions}`,
        editGoal = () => dispatch(Actions.modal.goal(goal));
    return (
        <Alert bsStyle={bsStyle}>
            <Glyphicon glyph="exclamation-sign"/>{'  '}
            You have a <strong>{p}%</strong> chance to {goal.parameters.exercise} <strong>{goalText}</strong> by
            {' '}{date}.
            <div className="pull-right goal-alert-button">
                <Button onClick={editGoal} bsStyle={bsStyle} bsSize="small"><Glyphicon glyph="edit"/></Button>
            </div>
        </Alert>
    );
};

const connectStrengthPercentiles = connect((s: IAppState, p: any) => {
    let r = s.root, {exercise, user_id} = p.match.params, all, country, state, city,
        sp = r.estimates.percentile.strength;
    try {
        all = sp.all[exercise][user_id];
    }
    catch (e) {
    }
    try {
        country = sp.country[exercise][user_id];
    } catch (e) {
    }
    try {
        state = sp.state[exercise][user_id];
    } catch (e) {
    }
    try {
        city = sp.city[exercise][user_id];
    } catch (e) {
    }

    return {...p, exercise, user_id, percentiles: {all, country, state, city}};
});

class StrengthPercentiles_ extends Percentiles {

    protected attribute = "achievements";

    protected getEstimatorAction(o: any, level: string) {
        return Actions.estimate.percentile.achievement.strength(o, level);
    }

    protected conditionsChanged(prevProps): boolean {
        return this.props.exercise != prevProps.exercise;
    }
}

const StrengthPercentiles = connectStrengthPercentiles(StrengthPercentiles_);

const connectStrengthAchievements = connect((state, props: IAchievementProps) => {
    let r = state.root,
        e = r.estimates,
        exercise = props.match.params.exercise,
        user = r.users[r.selected_user_id],
        at, achievements = [], est = {means: [], stds: [], days: []}, allEstimates,
        options = {defaultSortName: 'date', defaultSortOrder: 'desc'},
        goals = {}, goalEstimates = {};

    Object.keys(user.goals)
        .map(k => user.goals[k])
        .filter(g => g.goal_type_id == 3 && g.parameters.exercise == exercise)
        .forEach(g => {
            let est = r.estimates.goal[g.id];
            goals[g.id] = g;
            if (est) goalEstimates[g.id] = est;
        });
    if (user) {
        at = user.strength_achievements;
        achievements = Object.keys(at).map(k => at[k]).filter(a => a.exercise == exercise);
        allEstimates = e.strength[r.selected_user_id];
        est = allEstimates && allEstimates[exercise] || est;
    }
    return {
        ...props,
        achievements,
        goals, goalEstimates,
        estimates: est,
        options,
        user,
        exercise, ...props.match
    };
});

export class StrengthAchievements_ extends GoalRecord {

    protected attribute = "achievements";

    load() {
        let id = Math.max(...this.props.achievements.map(a => a.id)),
            a = {user_id: this.props.user.id, exercise: this.props.exercise, id};
        return this.props.dispatch(Actions.estimate.strength(a));
    }

    getPlotProps() {
        let i, e = this.props.estimates, childProps = {max: 0, error: 0}, today = moment();
        if (e && e.days && e.days.length > 0) {
            for (i = 0; i < e.days.length; i++) {
                if (e.days[i].dayOfYear() == today.dayOfYear() && e.days[i].year() == today.year()) {
                    childProps.max = e.means[i];
                    childProps.error = e.stds[i];
                    break;
                }
            }
        }
        return childProps;
    }

    addAchievement() {
        let p = this.props, exercise = p.match.params.exercise;
        p.dispatch(Actions.modal.achievement.strength({date: moment(), exercise}))
    }

    buttonFormatter(cell, row) {
        let click = e => this.props.dispatch(Actions.modal.achievement.strength(row));
        return <Button bsStyle="link" onClick={click}><Glyphicon glyph="edit"/></Button>
    }

    addGoal() {
        let p = this.props, exercise = p.match.params.exercise,
            g: IGoal = {
                user_id: p.user.id,
                goal_type_id: 3,
                parameters: {exercise}
            };
        return p.dispatch(Actions.modal.goal(g));
    }

    render() {
        let p = this.props, g = p.goals, ge = p.goalEstimates,
            showSpinner = (p.user.id == -1 || (p.achievements.length > 0 && !p.estimates.days.length)),
            showGraphs = p.achievements.length > 0 && p.estimates.days.length > 0,
            spinnerStyle = showSpinner ? {} : {display: "none"},
            alerts = Object.keys(ge).map(k => <StrengthGoalAlert key={k} goal={g[k]}
                                                                 probability={ge[k]} {...this.props}/>);
        return (
            <Grid fluid>
                <StrengthBanner {...this.props}/>
                {showGraphs && <StrengthAchievementGraphs {...this.props} {...this.getPlotProps()}/>}
                <div id="achievement-spinner" style={spinnerStyle}><img src="/static/img/loading.gif"/></div>
                {alerts.length > 0 && alerts}
                <Form horizontal>
                    <Col xs={1} componentClass={ControlLabel}>Add:</Col>
                    <Col xs={11}>
                        <ButtonGroup>
                            <Button bsStyle="primary" onClick={() => this.addAchievement()}>Achievement</Button>
                            <Button bsStyle="primary" onClick={() => this.addGoal()}>Goal</Button>
                        </ButtonGroup>
                    </Col>
                </Form>
                <BootstrapTable pagination striped hover condensed bordered={false} data={this.props.achievements}
                                options={this.props.options}>
                    <TableHeaderColumn dataField="id" isKey hidden>Id</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataField="date"
                                       dataFormat={d => d.format("MM/DD/YYYY")}>Date</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataField="weight">Weight</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataField="repetitions">Reps</TableHeaderColumn>
                    <TableHeaderColumn dataField="button" width="50px"
                                       dataFormat={(c, r) => this.buttonFormatter(c, r)}/>
                </BootstrapTable>
            </Grid>
        )
    }
}

export const StrengthAchievements = connectStrengthAchievements(StrengthAchievements_);