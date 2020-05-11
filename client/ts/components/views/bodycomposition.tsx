import * as React from 'react';
import {connect} from 'react-redux';
import * as moment from 'moment';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {BodyCompositionPlot} from '../plots/body-composition';
import {prettyNum, shallowEquality, xdate} from "../../common";
import {Grid} from "react-bootstrap";
import {IAppState, IRootState} from "../../state/root";
import {Actions} from "../../state/actions";


const connectBodyComposition = connect((s: IAppState, p) => {
    let r: IRootState = s.root,
        u = r.users[r.selected_user_id],
        wm = u.weight_measurements,
        bm = u.bodyfat_measurements,
        dp = u.diet_periods,
        weightEstimates = r.estimates.weight[u.id] || {means: [], stds: [], days: []},
        bodyfatEstimates = r.estimates.bodyfat[u.id] || {means: [], stds: [], days: []},
        weights = Object.keys(wm).map(k => wm[k]),
        bodyfats = Object.keys(bm).map(k => bm[k]),
        options = {defaultSortName: 'date', defaultSortOrder: 'desc'};

    return {weights, bodyfats, weightEstimates, bodyfatEstimates, options, user: u, ...p}
});

// Too different from Record to inherit without over-complicating the base class
class Bodycomposition_ extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {weightsEstimatesLoading: false, bodyfatsEstimatesLoading: false};
    }

    loadWeightEstimates() {
        this.setState({weightsEstimatesLoading: true});
        this.props.dispatch(Actions.estimate.weight(this.props.user))
            .then(this.setState({weightsEstimatesLoading: false}));
    }

    loadBodyfatEstimates() {
        this.setState({bodyfatsEstimatesLoading: true});
        this.props.dispatch(Actions.estimate.bodyfat(this.props.user))
            .then(this.setState({bodyfatsEstimatesLoading: false}));
    }

    shouldLoadEstimates(k, e, prevProps?) {
        if (this.props.user.id < 1 || !this.props[k].length || this.state[`${k}EstimatesLoading`]) return false;
        if (prevProps) {
            let attrEqual = shallowEquality(prevProps[k], this.props[k]);
            return prevProps.user.id != this.props.user.id || !attrEqual
        } else {
            let keys = Object.keys(this.props[k]),
                estimatesExist = e.days.length > 0;
            return keys.length > 0 && !estimatesExist;
        }
    }

    componentDidMount() {
        let loadWeights = this.shouldLoadEstimates("weights", this.props.weightEstimates),
            loadBodyfats = this.shouldLoadEstimates("bodyfats", this.props.bodyfatEstimates);
        if (loadWeights) this.loadWeightEstimates();
        if (loadBodyfats) this.loadBodyfatEstimates();
    }

    componentDidUpdate(prevProps) {
        let loadWeights = this.shouldLoadEstimates("weights", this.props.weightEstimates, prevProps),
            loadBodyfats = this.shouldLoadEstimates("bodyfats", this.props.bodyfatEstimates, prevProps);
        if (loadWeights) this.loadWeightEstimates();
        if (loadBodyfats) this.loadBodyfatEstimates();
    }

    getBodyComposition() {
        let be = this.props.bodyfatEstimates,
            we = this.props.weightEstimates,
            firstDay = be.days[0] < we.days[0] ? be.days[0] : we.days[0],
            today = xdate(),
            bodyCompositions = [];
        if (be.days.length && we.days.length) {
            let weByDay = {}, beByDay = {}, iDay = firstDay.clone();
            for (let i = 0; i < be.days.length; i++) {
                beByDay[be.days[i].valueOf()] = be.means[i];
            }
            for (let i = 0; i < we.days.length; i++) {
                weByDay[we.days[i].valueOf()] = we.means[i];
            }
            do {
                let bm, fm, lbm, d = iDay.valueOf();
                if (!weByDay[d] || !beByDay[d]) continue;
                bm = weByDay[d];
                fm = bm * beByDay[d] / 100;
                lbm = bm - fm;
                bodyCompositions.push({lbm, fm, bm, date: iDay.clone()})
            } while (iDay.add(1, 'day') <= today);
        }
        return bodyCompositions;
    }

    render() {
        let bc = this.getBodyComposition(),
            lbm = bc.map(e => e.lbm),
            fm = bc.map(e => e.fm),
            days = bc.map(e => e.date.toDate()),
            props;
        props = {lbm, fm, days};
        return (
            <Grid fluid>
                <BodyCompositionPlot {...props}/>
                <BootstrapTable striped hover condensed pagination bordered={false} options={this.props.options}
                                data={bc}>
                    <TableHeaderColumn dataField="date" isKey dataSort dataFormat={d => d.format("MM/DD/YYYY")}>
                        Date
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="bm" dataSort dataFormat={prettyNum}>
                        Weight
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="lbm" dataSort dataFormat={prettyNum}>
                        Lean Body Mass
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="fm" dataSort dataFormat={prettyNum}>
                        Fat Mass
                    </TableHeaderColumn>
                </BootstrapTable>
            </Grid>
        );
    }
}

export const BodyComposition = connectBodyComposition(Bodycomposition_);