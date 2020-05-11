import * as React from 'react';
import {connect} from 'react-redux';
import * as moment from 'moment';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {DietPlot} from '../plots/diet';
import {compareDates, prettyNum, shallowEquality, xdate} from "../../common";
import {Grid} from "react-bootstrap";
import {IAppState, IRootState} from "../../state/root";
import {Actions} from "../../state/actions";


const dietConnector = connect((s: IAppState, p) => {
    let r: IRootState = s.root, u = r.users[r.selected_user_id], ci = u.calorie_intakes, dp = u.diet_periods,
        intakes = Object.keys(ci).map(k => ci[k]),
        periods = Object.keys(dp).map(k => dp[k]),
        tdeeEstimates = r.estimates.tdee[u.id] || {means: [], stds: [], days: []},
        options = {defaultSortName: 'date', defaultSortOrder: 'desc'};

    return {intakes, periods, tdeeEstimates, options, user: u, ...p}
});


class Diet_ extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = this.getStateObj();
    }

    groupIntakes() {
        let intakesByDate = {};
        this.props.intakes.forEach(i => {
            let d = i.date.valueOf();
            if (!intakesByDate[d]) intakesByDate[d] = {date: i.date.clone(), items: []};
            intakesByDate[d].items.push(i);
        });
        return intakesByDate;
    }

    intakesByDate() {
        let days = this.props.tdeeEstimates.days,
            intakesByDate = this.groupIntakes(),
            calories = 0, protein = 0, carbohydrates = 0, fiber = 0, fat = 0, sumCal = 0, sumProtein = 0,
            sumCarbs = 0, sumFiber = 0, sumFat = 0, n = 0, endDay = xdate();
        this.props.periods.forEach(p => {
            let d, ed, items = [], iDay, initialDay;
            if (days.length == 0 || !p.example_date) return;
            ed = intakesByDate[p.example_date.valueOf()];
            initialDay = days[0].clone();
            iDay = p.start_date ? p.start_date.clone() : initialDay;
            do {
                d = iDay.valueOf();
                // ignore days for which no weight estimate is present
                if (compareDates(iDay, initialDay) < 0 || compareDates(iDay, endDay) > 0) return;
                if (ed && ed.items.length) items = ed.items;
                if (!intakesByDate[d] && items.length) intakesByDate[d] = {date: iDay.clone(), items: [...items]};
            } while (iDay.add(1, 'day').valueOf() <= endDay);
        });

        // Need the average daily intake to back fill any days present in estimates.days but not in intakesByDate
        Object.keys(intakesByDate).map(k => intakesByDate[k]).forEach(int => {
            sumCal += int.items.reduce((s, i) => s + i.value, 0);
            sumProtein += int.items.reduce((s, i) => s + i.protein, 0);
            sumCarbs += int.items.reduce((s, i) => s + i.carbohydrates, 0);
            sumFiber += int.items.reduce((s, i) => s + i.fiber, 0);
            sumFat += int.items.reduce((s, i) => s + i.fat, 0);
            n += 1;
        });

        if (n > 0) {
            calories = sumCal / n;
            protein = sumProtein / n;
            carbohydrates = sumCarbs / n;
            fiber = sumFiber / n;
            fat = sumFat / n;
        }

        // Need every day present in estimates.days to also be present in intakesByDate for tdee plot
        if (n > 0) {
            days.forEach(d => {
                let dv = d.valueOf();
                if (d <= endDay && !intakesByDate[dv]) {
                    intakesByDate[dv] = {date: d.clone(), calories, carbohydrates, fiber, protein, fat, items: []}
                }
            });
        }

        return intakesByDate;
    }

    private getNutrition(intakesByDate) {
        let nutrients = {calories: [], protein: [], carbohydrates: [], fiber: [], fat: []},
            intakes = Object.keys(intakesByDate).sort().map(d => intakesByDate[d]);
        intakes.forEach(d => {
            if (d.items.length > 0) {
                let calories = d.items.reduce((p, e) => p + e.value, 0),
                    protein = d.items.reduce((p, e) => p + e.protein, 0),
                    carbohydrates = d.items.reduce((p, e) => p + e.carbohydrates, 0),
                    fiber = d.items.reduce((p, e) => p + e.fiber, 0),
                    fat = d.items.reduce((p, e) => p + e.fat, 0);
                Object.assign(d, {calories, protein, carbohydrates, fiber, fat})
            }
        });

        intakes.forEach(d => {
            nutrients.calories.push(d.calories);
            nutrients.protein.push(d.protein);
            nutrients.carbohydrates.push(d.carbohydrates);
            nutrients.fiber.push(d.fiber);
            nutrients.fat.push(d.fat);
        });

        return nutrients;
    }

    private getStateObj() {
        let intakesByDate = this.intakesByDate(),
            {calories, protein, carbohydrates, fiber, fat} = this.getNutrition(intakesByDate),
            today = new Date(),
            days = Object.keys(intakesByDate).sort().map(k => intakesByDate[k].date.toDate()).filter(d => d <= today);
        return {
            calories, protein, carbohydrates, fiber, fat,
            data: Object.keys(intakesByDate).map(d => intakesByDate[d]),
            days: days
        };
    }

    load(user) {
        return this.props.dispatch(Actions.estimate.tdee(user));
    }

    componentDidMount() {
        if (this.props.user.id > 0) {
            this.load(this.props.user).then(this.setState(this.getStateObj()));
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.user.id != this.props.user.id && this.props.user.id > 0) {
            this.load(this.props.user).then(this.setState(this.getStateObj()));
        } else {
            let newEstimates = !shallowEquality(this.props.tdeeEstimates, prevProps.tdeeEstimates),
                newIntakes = !shallowEquality(this.props.intakes, prevProps.intakes),
                newPeriods = !shallowEquality(this.props.periods, prevProps.periods);
            if (newEstimates || newIntakes || newPeriods) {
                this.setState(this.getStateObj());
            }
        }
    }

    render() {
        return (
            <Grid fluid>
                <DietPlot {...this.state} tdees={this.props.tdeeEstimates.means}/>
                <DietTable data={this.state.data}/>
            </Grid>
        );
    }
}

export const Diet = dietConnector(Diet_);

class DietTable extends React.Component<any, any> {

    shouldExpand(row) {
        return row.items.length > 1;
    }

    expandComponent(row) {
        return <DietTableExpansion data={row.items}/>;
    }

    numberFormatter(cell, row) {
        let d = prettyNum(cell);
        if (row.items.length == 0) {
            return <span style={{opacity: 0.5}}>{d}</span>
        } else return d;
    }

    dateFormatter(cell, row) {
        let d = cell.format("MM/DD/YYYY");
        if (row.items.length == 0) {
            return <span style={{opacity: 0.5}}>{d}</span>
        } else return d;
    }

    render() {
        let options = {defaultSortName: 'date', defaultSortOrder: 'desc', expandRowBgColor: "rgba(100, 149, 237, 0.2)"};
        return (
            <BootstrapTable hover condensed bordered={false} data={this.props.data} options={options}
                            expandableRow={this.shouldExpand} expandComponent={this.expandComponent} pagination>
                <TableHeaderColumn dataField="date" dataFormat={(c, r) => this.dateFormatter(c, r)} isKey>
                    Date
                </TableHeaderColumn>
                <TableHeaderColumn dataField="calories" dataFormat={(c, r) => this.numberFormatter(c, r)}>
                    Calories
                </TableHeaderColumn>
                <TableHeaderColumn dataField="protein" dataFormat={(c, r) => this.numberFormatter(c, r)}>
                    Protein
                </TableHeaderColumn>
                <TableHeaderColumn dataField="carbohydrates" dataFormat={(c, r) => this.numberFormatter(c, r)}>
                    Carbohydrates
                </TableHeaderColumn>
                <TableHeaderColumn dataField="fiber" dataFormat={(c, r) => this.numberFormatter(c, r)}>
                    Fiber
                </TableHeaderColumn>
                <TableHeaderColumn dataField="fat" dataFormat={(c, r) => this.numberFormatter(c, r)}>
                    Fat
                </TableHeaderColumn>
            </BootstrapTable>
        )
    }
}

const DietTableExpansion = props => {
    let options = {defaultSortName: 'value', defaultSortOrder: 'desc'};
    return (
        <BootstrapTable striped hover condensed bordered={false} options={options} data={props.data}>
            <TableHeaderColumn dataField="id" isKey hidden>Id</TableHeaderColumn>
            <TableHeaderColumn dataField="name">Name</TableHeaderColumn>
            <TableHeaderColumn dataSort dataField="value" dataFormat={prettyNum}>Calories</TableHeaderColumn>
            <TableHeaderColumn dataSort dataField="protein" dataFormat={prettyNum}>Protein</TableHeaderColumn>
            <TableHeaderColumn dataSort dataField="carbohydrates"
                               dataFormat={prettyNum}>Carbohydrates</TableHeaderColumn>
            <TableHeaderColumn dataSort dataField="fiber" dataFormat={prettyNum}>Fiber</TableHeaderColumn>
            <TableHeaderColumn dataSort dataField="fat" dataFormat={prettyNum}>Fat</TableHeaderColumn>
        </BootstrapTable>
    );
};
        
