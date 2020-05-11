import * as jQuery from 'jquery';
import {appendLocationToUrl, branches, requestParams} from "./common";
import {
    BodyfatLeaderboardEntry,
    EnduranceLeaderboardEntry,
    IEnduranceAchievement,
    IStrengthAchievement,
    IUser,
    StrengthLeaderboardEntry,
    WeightGainLeaderboardEntry,
    WeightLossLeaderboardEntry
} from "../models";

export interface ILeaderboardState {
    strength: { [key: string]: StrengthLeaderboardEntry[] }
    endurance: { [key: string]: { [fixed: string]: { [value: number]: EnduranceLeaderboardEntry[] } } }
    bodyfat: BodyfatLeaderboardEntry[];
    weight_loss: WeightLossLeaderboardEntry[];
    weight_gain: WeightGainLeaderboardEntry[];
}

const
    strengthLeaderboard = `${branches.leaderboard}:STRENGTH`,
    enduranceLeaderboard = `${branches.leaderboard}:ENDURANCE`,
    bodyfatLeaderboard = `${branches.leaderboard}:BODYFAT`,
    weightLossLeaderboard = `${branches.leaderboard}:WEIGHT_LOSS`,
    weightGainLeaderboard = `${branches.leaderboard}:WEIGHT_GAIN`;


export class LeaderboardActions {
    public static strength(u: IUser, a: IStrengthAchievement) {
        let url = `/api/leaderboard/strength/${a.exercise}/${u.gender || "male"}/`;
        url = appendLocationToUrl(url, u);
        return dispatch => {
            return jQuery.ajax({...requestParams, url})
                .then(d => dispatch({type: strengthLeaderboard, exercise: a.exercise, results: d.results}));
        }
    }

    public static endurance(u: IUser, a: IEnduranceAchievement) {
        let value = a.fixed == "distance" ? `${a.distance}_${a.distance_type_id}` : a.time,
            url = `/api/leaderboard/endurance/${a.exercise}/${a.fixed}/${value}/${u.gender || "male"}/`;
        url = appendLocationToUrl(url, u);
        return dispatch => {
            return jQuery.ajax({...requestParams, url})
                .then(d => dispatch({
                    type: enduranceLeaderboard,
                    fixed: a.fixed,
                    value,
                    exercise: a.exercise,
                    results: d.results
                }));
        }
    }

    public static bodyfat(u: IUser, methods: number[]) {
        let url = `/api/leaderboard/bodyfat/${u.gender || "male"}/`, data;
        // sorting methods here to ensure leaderboard caching
        methods = methods.sort();
        data = methods.reduce((q, m) => q + `method=${m}&`, '?');
        url = appendLocationToUrl(url, u) + data;
        return dispatch => {
            return jQuery.ajax({
                type: 'GET',
                contentType: 'application/json',
                url
            }).then(d => dispatch({type: bodyfatLeaderboard, methods, results: d.results}));
        }
    }

    public static weight = class {
        public static loss(u: IUser) {
            let url = `/api/leaderboard/weight_loss/${u.gender || "male"}/`;
            return dispatch => {
                return jQuery.ajax({
                    type: 'GET',
                    contentType: 'application/json',
                    url: appendLocationToUrl(url, u)
                }).then(d => dispatch({type: weightLossLeaderboard, results: d.results}));
            }
        }

        public static gain(u: IUser) {
            let url = `/api/leaderboard/weight_gain/${u.gender || "male"}/`;
            return dispatch => {
                return jQuery.ajax({
                    type: 'GET',
                    contentType: 'application/json',
                    url: appendLocationToUrl(url, u)
                }).then(d => dispatch({type: weightGainLeaderboard, results: d.results}));
            }
        }
    }
}

export const leaderboardReducer = (s: ILeaderboardState, a): ILeaderboardState => {
    switch (a.type) {
        case enduranceLeaderboard:
            let fixed, exercise, endurance, results = a.results.map(e => new EnduranceLeaderboardEntry(e));
            try {
                fixed = {...s.endurance[a.exercise][a.fixed], [a.value]: results};
            } catch (e) {
                fixed = {[a.value]: results};
            }
            try {
                exercise = {...s.endurance[a.exercise], [a.fixed]: fixed};
            } catch (e) {
                exercise = {[a.fixed]: fixed};
            }
            endurance = {...s.endurance, [a.exercise]: exercise};
            return {...s, endurance};
        case strengthLeaderboard:
            let strengths = a.results.map(e => new StrengthLeaderboardEntry(e));
            return {...s, strength: {...s.strength, [a.exercise]: strengths}};
        case bodyfatLeaderboard:
            let bodyfat = a.results.map(e => new BodyfatLeaderboardEntry(e));
            return {...s, bodyfat};
        case weightLossLeaderboard:
            let weight_loss = a.results.map(e => new WeightLossLeaderboardEntry(e));
            return {...s, weight_loss};
        case weightGainLeaderboard:
            let weight_gain = a.results.map(e => new WeightGainLeaderboardEntry(e));
            return {...s, weight_gain};
        default:
            return s
    }
};