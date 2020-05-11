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
import {PaceEstimatorPlot} from '../../plots/pace-estimator';
import {Actions} from "../../../state/actions";
import {IAppState} from "../../../state/root";
import {IEnduranceAchievement, distanceTypes, unitsInFeet, IGoal} from "../../../models";
import {Percentiles, GoalRecord} from "../../base-components";
import {Set, Array} from 'es6-shim';
import {prettyNum} from "../../../common";

interface IAchievementProps {
    match?: { params?: { distance_type_id?: number, exercise?: string, user_id?: string, fixed?: string, value?: number } }
}

const prettyTime = seconds => {
    let t = moment.utc(Math.round(seconds) * 1000),
        h = t.hours(),
        m = t.minutes(),
        s = t.seconds(),
        parts = [];
        if (h) parts.push(`${h} hours`);
        if (m) parts.push(`${m} minutes`);
        if (s) parts.push(`${s} seconds`);
        return parts.join(", ")
};

const exerciseLabel = a => {
    let extra;
    if (a.fixed == "time") extra = prettyTime(a.time);
    else extra = `${a.distance} ${distanceTypes[a.distance_type_id]}`;
    return `${a.exercise} (${extra})`
};

const exerciseValue = a => {
    let params = [a.exercise];
    if (a.fixed) {
        params.push(a.fixed);
        if (a.fixed == "time") params.push(a.time);
        else params.push(a.distance * unitsInFeet[a.distance_type_id]);
    }
    return params.join(":");
};

const getExercises = achievements => {
    let options = [],
        seen = [];
    Object.keys(achievements).forEach(k => {
        let a = achievements[k],
            label = exerciseLabel(a);
        if (seen.indexOf(label) < 0) {
            options.push({label, value: exerciseValue(a), clearableValue: false});
            seen.push(label);
        }
    });
    return options;
};


const EnduranceBanner = (props: any) => {
    let u = props.user,
        a = u.endurance_achievements,
        exercise = props.match.params.exercise,
        exercises = getExercises(a),
        value,
        change = v => {
            let [exercise, fixed, value] = v.value.split(":"),
                url = `/achievement/endurance/${u.id}/${exercise}/`;
            if (fixed) url += `${fixed}/`;
            if (value) url += `${value}/`;
            return props.history.push(url);
        },
        url, distance, distance_type_id, time, showLeaderboardLinks;
    try {
        let ea = props.achievements[Object.keys(props.achievements)[0]];
        value = {label: exerciseLabel(ea), value: exerciseValue(ea)};
        showLeaderboardLinks = true;
        if (ea.fixed == "time") {
            url = `/leaderboard/endurance/${exercise}/time/${ea.time}/${u.gender}/`;
        } else {
            url = `/leaderboard/endurance/${exercise}/distance/${ea.distance}_${ea.distance_type_id}/${u.gender}/`;
        }
    } catch (e) {
        showLeaderboardLinks = false;
    }

    return (
        <div className="banner">
            <Form inline>
                <Row>
                    <div className="banner-selector form-horizontal">
                        <Col componentClass={ControlLabel} sm={1}>Exercise:</Col>
                        <Col sm={3}>
                            <Select openOnFocus={true} value={value} clearable={false} options={exercises} onChange={change}/>
                        </Col>
                    </div>
                    {showLeaderboardLinks &&
                    <Col sm={4}>
                        <div className="achievement-banner-leaderboard">
                            <span>Leaderboards: </span>
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
                    </Col>}
                    <Col sm={4}>
                        <EndurancePercentiles {...props}/>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

const EnduranceGoalAlert = ({goal, probability, dispatch}) => {
    let p = prettyNum(probability * 100),
        bsStyle = p >= 75 ? "success" : p < 25 ? "danger" : "warning",
        date = goal.date.format("LL"),
        exercise = goal.parameters.exercise.toLowerCase(),
        distanceUnits = distanceTypes[goal.parameters.distance_type_id].toLowerCase(),
        dur = moment.utc(goal.value * 1000),
        durationText = dur.hours() ? dur.format("H:mm:ss") : dur.format("m:ss"),
        target = `${goal.parameters.distance} ${distanceUnits} in ${durationText}`,
        editGoal = () => dispatch(Actions.modal.goal(goal));
    return (
        <Alert bsStyle={bsStyle}>
            <Glyphicon glyph="exclamation-sign"/>{'  '}
            You have a <strong>{p}%</strong> chance to meet your goal of {exercise} <strong>{target}</strong> by
            {' '}{date}.
            <div className="pull-right goal-alert-button">
                <Button onClick={editGoal} bsStyle={bsStyle} bsSize="small"><Glyphicon glyph="edit"/></Button>
            </div>
        </Alert>
    );
};

const connectEndurancePercentiles = connect((s: IAppState, p: any) => {
    let r = s.root, pm = p.match.params, all, country, state, city, fixed = p.fixed, value,
        ep = r.estimates.percentile.endurance;
    if (fixed == "time") {
        value = pm.value;
    } else {
        if (p.achievements.length > 0) {
            let a = p.achievements[0];
            value = `${a.distance}_${a.distance_type_id}`;
        }
    }
    try {
        all = ep.all[pm.exercise][fixed][value][pm.user_id];
    }
    catch (e) {
    }
    try {
        country = ep.country[pm.exercise][fixed][value][pm.user_id];
    } catch (e) {
    }
    try {
        state = ep.state[pm.exercise][fixed][value][pm.user_id];
    } catch (e) {
    }
    try {
        city = ep.city[pm.exercise][fixed][value][pm.user_id];
    } catch (e) {
    }

    return {...p, exercise: pm.exercise, user_id: pm.user_id, percentiles: {all, country, state, city}};
});


class EndurancePercentiles_ extends Percentiles {

    protected attribute = "achievements";

    protected getEstimatorAction(o: any, level: string) {
        return Actions.estimate.percentile.achievement.endurance(o, level);
    }

    protected conditionsChanged(prevProps): boolean {
        let p = this.props, pm = this.props.match.params, ppm = prevProps.match.params;
        return p.exercise != prevProps.exercise && pm.fixed == ppm.fixed && pm.value == ppm.value;
    }
}

const EndurancePercentiles = connectEndurancePercentiles(EndurancePercentiles_);

const connectEnduranceAchievements = connect((state, props: IAchievementProps) => {
    let r = state.root,
        e = r.estimates,
        {exercise, fixed, value} = props.match.params,
        user = r.users[r.selected_user_id],
        at, achievements = [], allEstimates = e.endurance[r.selected_user_id],
        est = {means: [], stds: [], days: []},
        options = {defaultSortName: 'date', defaultSortOrder: 'desc'},
        goals = {}, goalEstimates = {},
        isGoalType = g => {
            return g.goal_type_id == 4 &&
                g.parameters.exercise == exercise &&
                g.parameters.distance * unitsInFeet[g.parameters.distance_type_id] == value;
        };

    Object.keys(user.goals)
        .map(k => user.goals[k])
        .filter(isGoalType)
        .forEach(g => {
            let ge = r.estimates.goal[g.id];
            goals[g.id] = g;
            if (ge >= 0) goalEstimates[g.id] = ge;
        });
    if (user) {
        let valuesMatch = a => {
            if (fixed == "time") return a[fixed] == value;
            else {
                return a[fixed] * unitsInFeet[a.distance_type_id] == value;
            }
        },
        at = user.endurance_achievements;
        achievements = Object.keys(at).map(k => at[k]).filter(a => a.exercise == exercise);
        est = allEstimates && allEstimates[exercise] || est;
        if (fixed) {
            achievements = achievements.filter(a => a.fixed == fixed && valuesMatch(a));
        }
    }
    return {
        ...props,
        achievements,
        goals, goalEstimates,
        estimates: est,
        options,
        user,
        exercise, fixed, value, ...props.match
    };
});


class EnduranceAchievements_ extends GoalRecord {

    protected attribute = "achievements";

    load() {
        let p = this.props,
            {exercise, fixed} = p,
            distance_type_id = 4,
            value = parseFloat(p.value),
            id = Math.max(...this.props.achievements.map(a => a.id)),
            a: IEnduranceAchievement = {user_id: p.user.id, exercise, fixed, distance_type_id, id};
        if (p.fixed == "distance") a.distance = value;
        else a.time = value;
        return this.props.dispatch(Actions.estimate.endurance(a));
    }

    paceFormatter(cell, row) {
        let fps = row.distance * unitsInFeet[row.distance_type_id] / row.time,
            dur = moment.utc(5280 / fps * 1000);
        return dur.format("m:ss");
    }

    timeFormatter(t) {
        let dur = moment.utc(t * 1000);
        return dur.hours() ? dur.format("h:mm:ss") : dur.format("m:ss");
    }

    distanceFormatter(cell, row) {
        return `${cell} ${distanceTypes[row.distance_type_id]}`
    }

    buttonFormatter(cell, row) {
        let click = e => this.props.dispatch(Actions.modal.achievement.endurance(row));
        return <Button bsStyle="link" onClick={click}><Glyphicon glyph="edit"/></Button>
    }

    addAchievement() {
        let p = this.props, exercise = p.match.params.exercise,
            a: IEnduranceAchievement = {
                date: moment(),
                user_id: p.user.id,
                exercise
            };
        if (p.achievements.length > 0) {
            let last = p.achievements.sort((a, b) => a.date - b.date)[0];
            a.fixed = last.fixed;
            a.distance_type_id = last.distance_type_id;
            a.distance = last.distance;
        }
        return p.dispatch(Actions.modal.achievement.endurance(a))
    }

    addGoal() {
        let p = this.props, exercise = p.match.params.exercise,
            g: IGoal = {
                user_id: p.user.id,
                goal_type_id: 4,
                parameters: {exercise}
            };
        if (p.achievements.length > 0) {
            let last = p.achievements.sort((a, b) => a.date - b.date)[0];
            g.parameters.distance = last.distance;
            g.parameters.distance_type_id = last.distance_type_id;
        }
        return p.dispatch(Actions.modal.goal(g));
    }

    render() {
        let p = this.props, g = p.goals, ge = p.goalEstimates,
            showSpinner = (p.user.id == -1 || (p.achievements.length > 0 && !p.estimates.days.length)),
            showGraphs = p.achievements.length > 0 && p.estimates.days.length > 0,
            spinnerStyle = showSpinner ? {} : {display: "none"},
            x = p.achievements.map(a => a.date.toDate()),
            y = p.achievements.map(a => a.pace()),
            text = y.map(p => moment.utc(60000 * p).format("m:ss")),
            name,
            alerts = Object.keys(ge).map(k => <EnduranceGoalAlert key={k} goal={g[k]}
                                                                  probability={ge[k]} {...this.props}/>);
        if (p.match.params.fixed && p.achievements.length > 0) {
            let a = p.achievements[0],
                units = distanceTypes[a.distance_type_id].toLowerCase().slice(0, -1);
            name = `${a.distance} ${units} pace`;
        } else name = 'pace';
        return (
            <Grid fluid>
                <EnduranceBanner {...p}/>
                <div id="achievement-spinner" style={spinnerStyle}><img src="/static/img/loading.gif"/></div>
                {showGraphs && <PaceEstimatorPlot {...p} x={x} y={y} text={text} showPeak name={name}/>}
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
                <BootstrapTable striped hover condensed bordered={false} data={p.achievements}
                                options={p.options}>
                    <TableHeaderColumn dataField="id" isKey hidden>Id</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataField="date"
                                       dataFormat={d => d.format("MM/DD/YYYY")}>Date</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={c => this.timeFormatter(c)}
                                       dataField="time">Time</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={(c, r) => this.distanceFormatter(c, r)}
                                       dataField="distance">Distance</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={(c, r) => this.paceFormatter(c, r)}
                                       dataField="distance">Pace</TableHeaderColumn>
                    <TableHeaderColumn dataField="button" width="50px"
                                       dataFormat={(c, r) => this.buttonFormatter(c, r)}/>
                </BootstrapTable>
            </Grid>
        );
    }
}

export const EnduranceAchievements = connectEnduranceAchievements(EnduranceAchievements_);