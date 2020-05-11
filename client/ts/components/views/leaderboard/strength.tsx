import * as React from 'react';
import {connect} from 'react-redux';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {Link} from "react-router-dom";
import {Glyphicon, Col, Row, ControlLabel, Grid} from "react-bootstrap";
import Select from 'react-select';
import {CitySelectInput, CountrySelectInput, GenderSelectInput, StateSelectInput} from "../../base-components";
import {appendLocationToUrl, prettyNum, shallowEquality} from "../../../common";
import {mediaFormat} from "./common";
import {Search} from "../../../state/search";
import {IAppState} from "../../../state/root";
import {Actions} from "../../../state/actions";

const StrengthExerciseSelectInput = props => {
    let loadOptions = input => Search.exercise.strength({query: input})
        .then(results => ({options: results}));
    return <Select.Async {...props} openOnFocus={true} clearable={false} loadOptions={loadOptions}/>;
};


const StrengthLeaderboardBanner = props => {
    let {exercise, country, state, city, gender = props.user.gender} = props.match.params,
        h = props.history,
        toVal = v => ({value: v, label: v}),
        exerciseChange = v => {
            let url = `/leaderboard/strength/${v.value}/${gender}/`;
            h.push(appendLocationToUrl(url, props.match.params));
        },
        genderChange = v => {
            let url = `/leaderboard/strength/${exercise}/${v.value}/`;
            h.push(appendLocationToUrl(url, props.match.params));
        },
        countryChange = v => {
            let url = `/leaderboard/strength/${exercise}/${gender}/`;
            if (v && v.value) url += `${v.value}/`;
            h.push(url);
        },
        stateChange = v => {
            let url = `/leaderboard/strength/${exercise}/${gender}/${country}/`;
            if (v && v.value) url += `${v.value}/`;
            h.push(url);
        },
        cityChange = v => {
            let url = `/leaderboard/strength/${exercise}/${gender}/${country}/${state}/`;
            if (v && v.value) url += `${v.value}/`;
            h.push(url);
        };

    return (
        <Row>
            <Col md={3}>
                <ControlLabel>Exercise</ControlLabel>
                <StrengthExerciseSelectInput value={toVal(exercise)} onChange={exerciseChange}/>
            </Col>
            <Col md={2}>
                <ControlLabel>Gender</ControlLabel>
                <GenderSelectInput value={toVal(gender)} onChange={genderChange}/></Col>
            <Col md={2}>
                <ControlLabel>Country</ControlLabel>
                <CountrySelectInput value={toVal(country)} onChange={countryChange}/></Col>
            {country &&
            <Col md={2}>
                <ControlLabel>State</ControlLabel>
                <StateSelectInput country={country} value={toVal(state)} onChange={stateChange}/></Col>}
            {state &&
            <Col md={2}>
                <ControlLabel>City</ControlLabel>
                <CitySelectInput country={country} state={state} value={toVal(city)} onChange={cityChange}/>
            </Col>}
        </Row>
    );
};

const connectStrengthLeaderboard = connect((s: IAppState, p: any) => {
    let r = s.root,
        user = r.users[r.selected_user_id],
        params = {...p.match.params},
        exercise = params.exercise,
        entries = r.leaderboard.strength[exercise],
        options = {defaultSortName: 'adjusted_score', defaultSortOrder: 'desc'};
    return {user, exercise, params, entries, options, ...p}
});

class StrengthLeaderboard_ extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {loading: false};
    }

    componentDidMount() {
        let p = this.props;
        if (!this.state.loading && p.params.exercise) {
            this.setState({loading: true});
            p.dispatch(Actions.leaderboard.strength(p.params, p.params));
        }
    }

    componentDidUpdate(prevProps) {
        let p = this.props;
        if (p.params.exercise && !shallowEquality(p.params, prevProps.params) && !this.state.loading) {
            this.setState({loading: true});
            p.dispatch(Actions.leaderboard.strength(p.params, p.params));
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
            media = mediaFormat(this.props.dispatch);
        return (
            <Grid fluid>
                <StrengthLeaderboardBanner {...this.props}/>
                <BootstrapTable pagination striped hover condensed bordered={false} data={entries}
                                options={this.props.options}>
                    <TableHeaderColumn dataField="achievement_id" isKey hidden>Id</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataField="date"
                                       dataFormat={d => d.format("MM/DD/YYYY")}>Date</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={nameFormat} dataField="name">Name</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataField="weight">Weight</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataField="repetitions">Reps</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={prettyNum} dataField="predicted_1rm">
                        Predicted 1RM
                    </TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={prettyNum} dataField="adjusted_score">
                        Adjusted Score
                    </TableHeaderColumn>
                    <TableHeaderColumn width="50px" dataFormat={media} dataField="media"/>
                </BootstrapTable>
            </Grid>
        )
    }
}

export const StrengthLeaderboard = connectStrengthLeaderboard(StrengthLeaderboard_);