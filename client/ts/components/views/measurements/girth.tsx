import * as React from 'react';
import {connect} from 'react-redux';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import Select from 'react-select';
import {EstimatorPlot} from "../../plots/estimator";
import {Col, ControlLabel, Form, FormGroup, Row, Button, Glyphicon, Alert, ButtonGroup, Grid} from "react-bootstrap";
import {GoalRecord} from '../../base-components';
import * as moment from "moment";
import {Set, Array} from 'es6-shim';
import {prettyNum} from "../../../common";
import {Actions} from "../../../state/actions";
import {IAppState} from "../../../state/root";


const GirthBanner = (props: any) => {
    let u = props.user,
        a = u.girth_measurements,
        location = props.match.params.location,
        locations = new Set(Object.keys(a).map(k => a[k].location)),
        locationNames = Array.from(locations.keys()).sort().map(k => ({label: k, value: k, clearableValue: false})),
        change = v => {
            let location = encodeURIComponent(v.label);
            return props.history.push(`/measurement/girth/${u.id}/${location}/`);
        };
    return (
        <Form horizontal>
            <Row>
                <FormGroup controlId="measurement">
                    <Col componentClass={ControlLabel} xs={2}>Location:</Col>
                    <Col xs={4}><Select openOnFocus={true} value={location} options={locationNames} onChange={change}/></Col>
                </FormGroup>
            </Row>
        </Form>
    );
};

const GirthGoalAlert = ({goal, probability, dispatch}) => {
    let p = prettyNum(probability * 100),
        bsStyle = p >= 75 ? "success" : p < 25 ? "danger" : "warning",
        date = goal.date.format("LL"),
        editGoal = () => dispatch(Actions.modal.goal(goal));
    return (
        <Alert bsStyle={bsStyle}>
            <Glyphicon glyph="exclamation-sign"/>{'  '}
            You have a <strong>{p}%</strong> chance to meet your goal bodyfat of <strong>{goal.value}%</strong> by
            {' '}{date}.
            <div className="pull-right goal-alert-button">
                <Button onClick={editGoal} bsStyle={bsStyle} bsSize="small"><Glyphicon glyph="edit"/></Button>
            </div>
        </Alert>
    );
};

const connectGirth = connect((s: IAppState, p: any) => {
    let r = s.root, u = r.users[r.selected_user_id], gm = u.girth_measurements,
        measurementLocation = p.match.params.location,
        allEstimates = r.estimates.girth[u.id],
        girths = Object.keys(gm).map(k => gm[k]).filter(m => m.location == measurementLocation),
        estimates = allEstimates && allEstimates[measurementLocation] || {means: [], stds: [], days: []},
        options = {defaultSortName: 'date', defaultSortOrder: 'desc'},
        goals = {}, goalEstimates = {};

    Object.keys(u.goals)
        .map(k => u.goals[k])
        .filter(g => g.goal_type_id == 1 && g.location == measurementLocation)
        .forEach(g => {
            let est = r.estimates.goal[g.id];
            goals[g.id] = g;
            if (est) goalEstimates[g.id] = est;
        });
    return {girths, estimates, goals, goalEstimates, options, measurementLocation, user: u, ...p}
});

class Girth_ extends GoalRecord {

    protected attribute = "girths";

    load() {
        let id = Math.max(...this.props.girths.map(g => g.id)),
            measurement = {user_id: this.props.user.id, location: this.props.measurementLocation};
        return this.props.dispatch(Actions.estimate.girth(measurement, id));
    }

    addGirth() {
        let location = this.props.match.params.location;
        this.props.dispatch(Actions.modal.measurement.girth({date: moment(), location}));
    }

    addGoal() {
        this.props.dispatch(Actions.modal.goal({goal_type_id: 5, parameters: {location}}));
    }

    buttonFormatter(cell, row) {
        let click = e => this.props.dispatch(Actions.modal.measurement.girth(row));
        return <Button bsStyle="link" onClick={click}><Glyphicon glyph="edit"/></Button>
    }

    render() {
        let {girths, estimates} = this.props,
            x = girths.map(e => new Date(e.date.format("YYYY/MM/DD"))),
            y = girths.map(e => e.value),
            g = this.props.goals,
            ge = this.props.goalEstimates,
            name = `${girths[0].location} girth`,
            yLabel = `${girths[0].location} girth (Inches)`,
            alerts = Object.keys(ge).map(k => <GirthGoalAlert key={k} goal={g[k]}
                                                              probability={ge[k]} {...this.props}/>);
        return (
            <Grid fluid>
                <GirthBanner {...this.props}/>
                {estimates.days.length > 0 &&
                <EstimatorPlot name={name} x={x} y={y} yLabel={yLabel} {...this.props}/>}
                {alerts.length > 0 && alerts}
                <Form horizontal>
                    <Col xs={1} componentClass={ControlLabel}>Add:</Col>
                    <Col xs={11}>
                        <ButtonGroup>
                            <Button bsStyle="primary" onClick={() => this.addGirth()}>Girth</Button>
                            <Button bsStyle="primary" onClick={() => this.addGoal()}>Goal</Button>
                        </ButtonGroup>
                    </Col>
                </Form>
                <BootstrapTable striped hover pagination condensed options={this.props.options} bordered={false}
                                data={girths}>
                    <TableHeaderColumn dataField="id" isKey hidden>Id</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataField="date"
                                       dataFormat={d => d.format("MM/DD/YYYY")}>Date</TableHeaderColumn>
                    <TableHeaderColumn dataFormat={c => `${c} inches`} dataField="value"
                                       dataSort>Girth</TableHeaderColumn>
                    <TableHeaderColumn dataField="button" width="50px"
                                       dataFormat={(c, r) => this.buttonFormatter(c, r)}/>
                </BootstrapTable>
            </Grid>
        );
    }
}

export const Girth = connectGirth(Girth_);