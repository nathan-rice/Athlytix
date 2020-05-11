import * as React from 'react';
import * as TreeView from 'react-treeview';
import {
    GirthMeasurement, StrengthAchievement, EnduranceAchievement, WeightMeasurement, BodyfatMeasurement, Goal,
    CalorieExpenditure, CalorieIntake, IDietPeriod, ITrainingPeriod, Workout, User
} from '../../../models';
import {Moment} from 'moment';

export const newCalendarDay = (date): ICalendarDay => {
    return {
        date: date,
        intake: [],
        expenditure: [],
        weight: [],
        bodyfat: [],
        girth: [],
        strength: [],
        endurance: [],
        goal: [],
        workouts: []
    }
};

export interface ICalendarDay {
    date: Moment;
    diet?: IDietPeriod;
    training?: ITrainingPeriod;
    intake?: CalorieIntake[];
    expenditure?: CalorieExpenditure[];
    weight?: WeightMeasurement[];
    bodyfat?: BodyfatMeasurement[];
    girth?: GirthMeasurement[];
    strength?: StrengthAchievement[];
    endurance?: EnduranceAchievement[];
    goal?: Goal[],
    workouts?: Workout[];
}

export interface ICalendarMonth {
    days: { [key: number]: ICalendarDay };
}

export interface ICalendarProps {
    month: ICalendarMonth;
    selected: Moment;
    dispatch: Function;
    view: "day" | "week" | "month";
    user?: User;
}

export interface ICalendarDayProps {
    day: ICalendarDay;
    selected?: Moment;
    stub?: boolean;
    dispatch: Function;
}

export abstract class CollapsableList extends React.Component<any, { collapsed: boolean }> {
    constructor(props) {
        super(props);
        this.state = {collapsed: false};
    }

    abstract toComponent(i);
    abstract title: string;
    alwaysDisplayTree = false;

    toggleCollapse() {
        this.setState({collapsed: !this.state.collapsed})
    }

    render() {
        let components = this.props.items.map(e => this.toComponent(e)),
            onClick = this.toggleCollapse.bind(this),
            label = <span className="calendar-day-tree-view-header" onClick={onClick}>{this.title}</span>;
        if (components.length > 2 || this.alwaysDisplayTree) {
            return (
                <TreeView nodeLabel={label} collapsed={this.state.collapsed} onClick={onClick}>
                    {components}
                </TreeView>
            );
        }
        else return <div>{components}</div>;
    }
}