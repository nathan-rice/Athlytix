import * as React from 'react';
import {connect} from 'react-redux';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {Link} from "react-router-dom";
import {Glyphicon, Col, Row, ControlLabel, FormControl, Button, Grid} from "react-bootstrap";
import Select from 'react-select';
import {distanceTypes} from "../../../models";
import * as moment from "moment";
import {CitySelectInput, CountrySelectInput, GenderSelectInput, StateSelectInput} from "../../base-components";
import {Search} from "../../../state/search";
import {appendLocationToUrl, shallowEquality} from "../../../common";
import {IAppState} from "../../../state/root";
import {Actions} from "../../../state/actions";


const EnduranceExerciseSelectInput = props => {
    let loadOptions = input => Search.exercise.endurance({query: input})
        .then(results => ({options: results}));
    return <Select.Async {...props} openOnFocus={true} clearable={false} loadOptions={loadOptions}/>;
};


const FixedSelectInput = props => {
    let options = [{label: "distance", value: "distance"}, {label: "time", value: "time"}];
    return <Select openOnFocus={true} {...props} options={options} clearable={false}/>
};

const UnitsSelectInput = props => {
    let dt = distanceTypes,
        options = Object.keys(dt).reduce((o, k) => o.concat({label: dt[k], value: k}), []);
    return <Select openOnFocus={true} {...props} options={options} clearable={false}/>
};

class EnduranceLeaderboardBanner extends React.Component<any, any> {

    private setStateFromProps(props) {
        let p = props.match.params,
            {gender = props.user.gender, fixed = "distance", value = ""} = p,
            hours, minutes, seconds, t, distance, distance_type_id;
        [distance, distance_type_id] = value.split("_");
        distance = parseFloat(distance) || "";
        distance_type_id = parseInt(distance_type_id) || 1;
        if (value.includes("_")) {
            t = moment.utc(p.value * 1000);
            hours = t.hours();
            minutes = t.minutes();
            seconds = t.seconds();
        }
        this.setState({fixed, hours, minutes, seconds, distance, distance_type_id, gender})
    }

    componentWillMount() {
        this.setStateFromProps(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.setStateFromProps(nextProps);
    }

    fixedChange(v) {
        this.setState({fixed: v.value})
    }

    distanceChange(e) {
        this.setState({distance: e.target.value})
    }

    distanceUnitChange(v) {
        this.setState({distance_type_id: v.value})
    }

    hourChange(e) {
        this.setState({hours: e.target.value})
    }

    minuteChange(e) {
        this.setState({minutes: e.target.value})
    }

    secondChange(e) {
        this.setState({seconds: e.target.value})
    }

    validValue(v) {
        if (this.state.fixed == "distance") {
            let [d, i] = v.split("_");
            return d.length > 0 && i.length > 0;
        } else return v.length > 0;
    }

    exerciseChange(v) {
        let h = this.props.history,
            {fixed, gender} = this.state,
            value = this.getValue(),
            url = `/leaderboard/endurance/${v.value}/${fixed}/${value}/${gender}/`;
        if (v && v.value) {
            this.setState({exercise: v.value});
            if (fixed && this.validValue(value) && gender)
                h.push(appendLocationToUrl(url, this.props.match.params));
        }

    }

    genderChange(v) {
        let h = this.props.history,
            {fixed, exercise} = this.state,
            value = this.getValue(),
            url = `/leaderboard/endurance/${exercise}/${fixed}/${value}/${v.value}/`;
        if (v && v.value) {
            this.setState({gender: v.value});
            if (fixed && exercise && this.validValue(value))
                h.push(appendLocationToUrl(url, this.props.match.params));
        }

    }

    countryChange(v) {
        let h = this.props.history,
            {exercise, fixed, gender} = this.state,
            value = this.getValue(),
            url = `/leaderboard/endurance/${exercise}/${fixed}/${value}/${gender}/`;

        if (v && v.value) {
            url += `${v.value}/`;
            this.setState({country: v.value, state: null, city: null});
            if (exercise && fixed && this.validValue(value) && gender) h.push(url);
        }
    }

    stateChange(v) {
        let h = this.props.history,
            {exercise, fixed, gender, country} = this.state,
            value = this.getValue(),
            url = `/leaderboard/endurance/${exercise}/${fixed}/${value}/${gender}/${country}/`;
        if (v && v.value) {
            url += `${v.value}/`;
            this.setState({state: v.value});
            if (exercise && fixed && this.validValue(value) && gender) h.push(url);
        }
    }

    cityChange(v) {
        let h = this.props.history,
            {exercise, fixed, gender, country, state} = this.state,
            value = this.getValue(),
            url = `/leaderboard/endurance/${exercise}/${fixed}/${value}/${gender}/${country}/${state}/`;
        if (v && v.value) {
            url += `${v.value}/`;
            this.setState({city: v.value});
            if (exercise && fixed && this.validValue(value) && gender) h.push(url);
        }
    }

    changeParameters() {
        let value = this.getValue(),
            {exercise, fixed, gender} = this.state,
            url = `/leaderboard/endurance/${exercise}/${fixed}/${value}/${gender}/`;
        this.props.history.push(appendLocationToUrl(url, this.props.match.params));
    }

    getValue() {
        let fixed = this.state.fixed;
        if (fixed == "time") {
            let h = this.state.hours || 0, m = this.state.minutes || 0, s = this.state.seconds || 0;
            return `${3600 * h + 60 * m + s}`;
        }
        else {
            return `${this.state.distance}_${this.state.distance_type_id}`;
        }
    }

    searchDisabled() {
        if (this.state.fixed == "time") {
            // can't use less than here because of the possibility of undefined values
            return !(this.state.hours > 0 || this.state.minutes > 0 || this.state.seconds > 0);
        } else return !(this.state.distance > 0);
    }

    render() {
        let {exercise, fixed, distance, hours, minutes, seconds, gender, country, state, city} = this.state,
            toVal = v => ({value: v, label: v}),
            u = {label: distanceTypes[this.state.distance_type_id], value: this.state.distance_type_id};
        return (
            <div>
                <Row>
                    <Col md={3}>
                        <ControlLabel>Exercise</ControlLabel>
                        <EnduranceExerciseSelectInput value={toVal(exercise)} onChange={e => this.exerciseChange(e)}/>
                    </Col>
                    <Col md={2}>
                        <ControlLabel>Fixed</ControlLabel>
                        <FixedSelectInput value={toVal(fixed)} onChange={e => this.fixedChange(e)}/>
                    </Col>
                    {fixed == "distance" && [
                        <Col key={1} md={2}>
                            <ControlLabel>Distance</ControlLabel>
                            <FormControl type="number" defaultValue={distance} name="distance"
                                         onChange={e => this.distanceChange(e)}/>
                        </Col>,
                        <Col key={2} md={2}>
                            <ControlLabel>Units</ControlLabel>
                            <UnitsSelectInput value={u} onChange={e => this.distanceUnitChange(e)}/>
                        </Col>
                    ]}
                    {fixed == "time" && [
                        <Col key={3} md={2}>
                            <ControlLabel>Hours</ControlLabel>
                            <FormControl type="number" value={hours} name="hours"
                                         onChange={e => this.hourChange(e)}/>
                        </Col>,
                        <Col key={4} md={2}>
                            <ControlLabel>Minutes</ControlLabel>
                            <FormControl type="number" value={minutes} name="hours"
                                         onChange={e => this.minuteChange(e)}/>
                        </Col>,
                        <Col key={5} md={2}>
                            <ControlLabel>Seconds</ControlLabel>
                            <FormControl type="number" value={seconds} name="hours"
                                         onChange={e => this.secondChange(e)}/>
                        </Col>
                    ]}
                    <Col md={1}>
                        <div id="endurance-banner-search-button">
                            <Button disabled={this.searchDisabled()} bsStyle="primary"
                                    onClick={e => this.changeParameters()}>
                                <Glyphicon glyph="search"/>
                            </Button>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col md={3}>
                        <ControlLabel>Gender</ControlLabel>
                        <GenderSelectInput value={toVal(gender)}
                                           onChange={e => this.genderChange(e)}/>
                    </Col>
                    <Col md={3}>
                        <ControlLabel>Country</ControlLabel>
                        <CountrySelectInput value={toVal(country)} onChange={e => this.countryChange(e)}/>
                    </Col>
                    {country &&
                    <Col md={3}>
                        <ControlLabel>State</ControlLabel>
                        <StateSelectInput country={country} value={toVal(state)}
                                          onChange={e => this.stateChange(e)}/>
                    </Col>}
                    {state &&
                    <Col md={3}>
                        <ControlLabel>City</ControlLabel>
                        <CitySelectInput country={country} state={state} value={toVal(city)}
                                         onChange={e => this.cityChange(e)}/>
                    </Col>}
                </Row>
            </div>
        );
    }
}


const connectEnduranceLeaderboard = connect((s: IAppState, p: any) => {
    let r = s.root,
        user = r.users[r.selected_user_id],
        params = {...p.match.params},
        exercise = params.exercise,
        entries,
        {fixed = "distance", value = ""} = p.match.params,
        options;
    if (params.fixed == "distance") {
        options = {defaultSortName: 'time', defaultSortOrder: 'asc'};
    } else {
        options = {defaultSortName: 'distance', defaultSortOrder: 'desc'};
    }
    try {
        entries = r.leaderboard.endurance[exercise][params.fixed][params.value];
    } catch (e) {
    }
    return {user, exercise, fixed, value, params, entries, options, ...p}
});


class EnduranceLeaderboard_ extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {loading: false};
    }

    componentDidMount() {
        let p = this.props, a = {...p.params};
        [a.distance, a.distance_type_id] = p.value.split("_");
        if (!this.state.loading && a.exercise) {
            this.setState({loading: true});
            p.dispatch(Actions.leaderboard.endurance(a, a));
        }
    }

    componentDidUpdate(prevProps) {
        let p = this.props, a = {...p.params};
        [a.distance, a.distance_type_id] = p.value.split("_");
        if (!shallowEquality(p.params, prevProps.params) && !this.state.loading && a.exercise) {
            this.setState({loading: true});
            p.dispatch(Actions.leaderboard.endurance(a, a));
        }
        if (this.state.loading && p.entries && prevProps.entries != p.entries) {
            this.setState({loading: false});
        }
    }

    render() {
        let entries = this.props.entries || [],
            nameFormat = (cell, row) => {
                let url = `/user/${row.user_id}/`;
                return <Link to={url}>{row.first_name} {row.last_name}</Link>
            },
            distanceFormat = (cell, row) => `${cell} ${distanceTypes[row.distance_type_id]}`,
            timeFormat = v => {
                let t = moment.utc(v * 1000);
                return t.hours() ? t.format("h:mm:ss") : t.format("m:ss");
            };
        return (
            <Grid fluid>
                <EnduranceLeaderboardBanner {...this.props}/>
                <BootstrapTable pagination striped hover condensed bordered={false} data={entries}
                                options={this.props.options}>
                    <TableHeaderColumn dataField="achievement_id" isKey hidden>Id</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataField="date"
                                       dataFormat={d => d.format("MM/DD/YYYY")}>Date</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={nameFormat} dataField="name">Name</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={distanceFormat}
                                       dataField="distance">Distance</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={timeFormat} dataField="time">Time</TableHeaderColumn>
                </BootstrapTable>
            </Grid>
        )
    }
}

export const EnduranceLeaderboard = connectEnduranceLeaderboard(EnduranceLeaderboard_);