import * as jQuery from 'jquery';
import {Moment} from 'moment';
import {branches} from "./common";
import {
    IBodyfatMeasurement, IEnduranceAchievement, IGirthMeasurement, IStrengthAchievement, IUser, unitsInFeet
} from "../models";
import {xdate} from "../common";

interface IMultiEstimateState {
    [id: number]: { [key: string]: { means: number[], stds: number[], days: Moment[] } }
}

interface ISingleEstimateState {
    [id: number]: { means: number[], stds: number[], days: Moment[] }
}

interface IPercentileState {
    all: IPercentileLevelState;
    country: IPercentileLevelState;
    state: IPercentileLevelState;
    city: IPercentileLevelState;
}

interface IPercentileLevelState {
    [exercise: string]: { [userId: number]: number }
}

export interface IEstimateState {
    strength: IMultiEstimateState;
    endurance: IMultiEstimateState;
    weight: ISingleEstimateState;
    girth: IMultiEstimateState;
    bodyfat: ISingleEstimateState;
    tdee: ISingleEstimateState;
    goal: { [id: number]: number }
    percentile: {
        strength: IPercentileState,
        endurance: IPercentileState,
        bodyfat: {
            all: { [userId: number]: number },
            country: { [userId: number]: number },
            state: { [userId: number]: number },
            city: { [userId: number]: number }
        }
    }
}

const
    estimateStrength = `${branches.estimates}:STRENGTH`,
    estimateEndurance = `${branches.estimates}:ENDURANCE`,
    estimateWeight = `${branches.estimates}:WEIGHT`,
    estimateBodyfat = `${branches.estimates}:BODYFAT`,
    estimateGirth = `${branches.estimates}:GIRTH`,
    estimateGoal = `${branches.estimates}:GOAL`,
    estimateTdee = `${branches.estimates}:TDEE`,
    strengthPercentile = `${branches.estimates}:STRENGTH_PERCENTILE`,
    endurancePercentile = `${branches.estimates}:ENDURANCE_PERCENTILE`,
    bodyfatPercentile = `${branches.estimates}:BODYFAT_PERCENTILE`;


export class EstimatesActions {
    public static strength(a: IStrengthAchievement) {
        let {user_id, exercise} = a;
        return dispatch => {
            let url = `/api/estimate/${user_id}/strength/${encodeURI(exercise)}/`;
            if (a.id) url += `?id=${a.id}`;
            return jQuery.ajax({
                url,
                contentType: "application/json",
                dataType: "json"
            }).then(d => {
                dispatch({type: estimateStrength, user_id, exercise, estimates: d});
                return d;
            });
        }
    }

    public static endurance(a: IEnduranceAchievement) {
        let {user_id, exercise, fixed} = a, value,
            url = `/api/estimate/${user_id}/endurance/${encodeURI(exercise)}/`;
        if (fixed) {
            if (fixed == "distance") value = a[fixed] * unitsInFeet[a.distance_type_id];
            else value = a.time;
            url += `${fixed}/${value}/`
        }
        if (a.id) url += `?id=${a.id}`;
        return dispatch => {
            return jQuery.ajax({
                url,
                contentType: "application/json",
                dataType: "json"
            }).then(d => {
                let estimates = {...d};
                if (fixed) {
                    estimates.fixed = fixed;
                    estimates.value = value;
                }
                return dispatch({type: estimateEndurance, user_id, exercise, estimates})
            });
        }
    }

    public static weight(u: IUser, id?: number) {
        return dispatch => {
            let url = `/api/estimate/${u.id}/weight/`;
            if (id) url += `?id=${id}`;
            return jQuery.ajax({
                url,
                contentType: "application/json",
                dataType: "json"
            }).then(d => dispatch({type: estimateWeight, user_id: u.id, estimates: d}));
        }
    };

    public static bodyfat(u: IUser, id?: number) {
        return dispatch => {
            let url = `/api/estimate/${u.id}/bodyfat/`;
            if (id) url += `?id=${id}`;
            return jQuery.ajax({
                url,
                contentType: "application/json",
                dataType: "json"
            }).then(d => dispatch({type: estimateBodyfat, user_id: u.id, estimates: d}));
        }
    };

    public static girth(m: IGirthMeasurement, id?: number) {
        return dispatch => {
            let url = `/api/estimate/${m.user_id}/girth/${m.location}/`;
            if (id) url += `?id=${id}`;
            return jQuery.ajax({
                url,
                contentType: "application/json",
                dataType: "json"
            }).then(d => dispatch({type: estimateGirth, user_id: m.user_id, location: m.location, estimates: d}));
        }
    };

    public static tdee(u: IUser, id?: number) {
        return dispatch => {
            let url = `/api/estimate/${u.id}/tdee/`;
            if (id) url += `?id=${id}`;
            return jQuery.ajax({
                url,
                contentType: "application/json",
                dataType: "json"
            }).then(d => dispatch({type: estimateTdee, user_id: u.id, estimates: d}));
        }
    };

    public static goal(goals: number[]) {
        return dispatch => {
            return jQuery.ajax({
                url: `/api/goal/probability/`,
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(goals),
                dataType: "json"
            }).then(d => dispatch({type: estimateGoal, probabilities: d.probabilities}));
        }
    }

    public static percentile = class {
        public static achievement = class {
            public static strength(a: IStrengthAchievement, level) {
                return dispatch => {
                    return jQuery.ajax({
                        url: `/api/percentile/strength/${a.exercise}/${a.user_id}/${level}/?id=${a.id}`,
                        type: "GET",
                        contentType: "application/json"
                    }).then(d => {
                        let action = {
                            type: strengthPercentile, exercise: a.exercise, level,
                            user_id: a.user_id, result: d.result
                        };
                        dispatch(action);
                    });
                }
            };

            public static endurance(a: IEnduranceAchievement, level) {
                return dispatch => {
                    let url = `/api/percentile/endurance/${a.exercise}/`,
                        value;
                    if (a.fixed) {
                        if (a.fixed == "distance") value = `${a[a.fixed]}_${a.distance_type_id}`;
                        else value = a.time;
                        url += `${a.fixed}/${value}/`
                    }
                    url += `${a.user_id}/${level}/?id=${a.id}`;
                    return jQuery.ajax({
                        url,
                        type: "GET",
                        contentType: "application/json"
                    }).then(d => {
                        let action = {
                            type: endurancePercentile,
                            exercise: a.exercise,
                            level,
                            value,
                            fixed: a.fixed,
                            user_id: a.user_id,
                            result: d.result
                        };
                        dispatch(action);
                    });
                }
            }
        };

        public static measurement = class {
            public static bodyfat(m: IBodyfatMeasurement, level) {
                return dispatch => {
                    return jQuery.ajax({
                        url: `/api/percentile/bodyfat/${m.user_id}/${level}/?id=${m.id}`,
                        type: "GET",
                        contentType: "application/json",
                    }).then(d => dispatch({type: bodyfatPercentile, level, user_id: m.user_id, result: d.result}));
                }
            }
        }
    }
}

export const estimatesReducer = (s: IEstimateState, a): IEstimateState => {
    let userEstimates, days, strength, endurance, level, fixed, value, exercise;
    switch (a.type) {
        case estimateStrength:
            days = a.estimates.days.map(d => xdate(d));
            userEstimates = {...s.strength[a.user_id], [a.exercise]: {...a.estimates, days}};
            strength = {...s.strength, [a.user_id]: userEstimates};
            return {...s, strength};
        case estimateWeight:
            let weight;
            days = a.estimates.days.map(d => xdate(d));
            weight = {...s.weight, [a.user_id]: {...a.estimates, days}};
            return {...s, weight};
        case estimateBodyfat:
            let bodyfat;
            days = a.estimates.days.map(d => xdate(d));
            bodyfat = {...s.bodyfat, [a.user_id]: {...a.estimates, days}};
            return {...s, bodyfat};
        case estimateGirth:
            let girth;
            days = a.estimates.days.map(d => xdate(d));
            userEstimates = {...s.girth[a.user_id], [a.location]: {...a.estimates, days}};
            girth = {...s.girth, [a.user_id]: userEstimates};
            return {...s, girth};
        case estimateEndurance:
            days = a.estimates.days.map(d => xdate(d));
            userEstimates = {...s.endurance[a.user_id], [a.exercise]: {...a.estimates, days}};
            endurance = {...s.endurance, [a.user_id]: userEstimates};
            return {...s, endurance};
        case estimateTdee:
            days = a.estimates.days.map(d => xdate(d));
            return {...s, tdee: {...s.tdee, [a.user_id]: {...a.estimates, days}}};
        case estimateGoal:
            return {...s, goal: {...s.goal, ...a.probabilities}};
        case strengthPercentile:
            exercise = {...s.percentile.strength[a.level][a.exercise], [a.user_id]: a.result};
            level = {...s.percentile.strength[a.level], [a.exercise]: exercise};
            strength = {...s.percentile.strength, [a.level]: level};
            return {...s, percentile: {...s.percentile, strength}};
        case endurancePercentile:
            try {
                value = {...s.percentile.endurance[a.level][a.exercise][a.fixed][a.value], [a.user_id]: a.result};
            } catch (e) {
                value = {[a.user_id]: a.result};
            }
            try {
                fixed = {...s.percentile.endurance[a.level][a.exercise][a.fixed], [a.value]: value};
            } catch (e) {
                fixed = {[a.value]: value};
            }
            try {
                exercise = {...s.percentile.endurance[a.level][a.exercise], [a.fixed]: fixed};
            } catch (e) {
                exercise = {[a.fixed]: fixed};
            }
            try {
                level = {...s.percentile.endurance[a.level], [a.exercise]: exercise};
            } catch (e) {
                level = {[a.exercise]: exercise};
            }
            endurance = {...s.percentile.endurance, [a.level]: level};
            return {...s, percentile: {...s.percentile, endurance}};
        case bodyfatPercentile:
            value = {...s.percentile.bodyfat[a.level], [a.user_id]: a.result};
            return {...s, percentile: {...s.percentile, bodyfat: {...s.percentile.bodyfat, [a.level]: value}}};
        default:
            return s
    }
};

export const defaultEstimateState = (): IEstimateState => {
    return {
        strength: {}, endurance: {}, weight: {}, girth: {}, bodyfat: {}, tdee: {}, goal: {},
        percentile: {
            bodyfat: {
                all: {},
                country: {},
                state: {},
                city: {},
            },
            strength: {
                all: {},
                country: {},
                state: {},
                city: {}
            },
            endurance: {
                all: {},
                country: {},
                state: {},
                city: {}
            }
        }
    }
};