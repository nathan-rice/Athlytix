import * as jQuery from 'jquery';
import {branches} from "./common";
import {
    BodyfatMeasurement, CalorieExpenditure, CalorieIntake, DietPeriod, EnduranceAchievement, GirthMeasurement, Goal,
    IUser, StrengthAchievement, TrainerRequest, TrainingPeriod, User, WeightMeasurement
} from "../models";

const
    listStrengths = `${branches.list}:STRENGTH`,
    listEndurances = `${branches.list}:ENDURANCE`,
    listWeights = `${branches.list}:WEIGHT`,
    listBodyfats = `${branches.list}:BODYFAT`,
    listGirths = `${branches.list}:GIRTH`,
    listIntakes = `${branches.list}:INTAKE`,
    listExpenditures = `${branches.list}:EXPENDITURE`,
    listGoals = `${branches.list}:GOAL`,
    listDietPeriods = `${branches.list}:DIET_PERIOD`,
    listTrainingPeriods = `${branches.list}:TRAINING_PERIOD`,
    listPrograms = `${branches.list}:PROGRAM`,
    listTrainerRequests = `${branches.list}:TRAINER_REQUEST`;

export class ListActions {

    public static all(user?) {
        return (dispatch, getState) => {
            let selectedUser = user.id || getState().root.selected_user_id;
            jQuery.ajax({
                url: `/api/user/${selectedUser}/all/`,
                type: 'GET',
                contentType: 'application/json',
                dataType: 'json'
            }).then(d => {
                dispatch({type: listGoals, id: selectedUser, data: d.goals});
                dispatch({type: listStrengths, id: selectedUser, data: d.strength_achievements});
                dispatch({type: listEndurances, id: selectedUser, data: d.endurance_achievements});
                dispatch({type: listIntakes, id: selectedUser, data: d.calorie_intakes});
                dispatch({type: listExpenditures, id: selectedUser, data: d.calorie_expenditures});
                dispatch({type: listWeights, id: selectedUser, data: d.weight_measurements});
                dispatch({type: listBodyfats, id: selectedUser, data: d.bodyfat_measurements});
                dispatch({type: listGirths, id: selectedUser, data: d.girth_measurements});
                dispatch({type: listDietPeriods, id: selectedUser, data: d.diet_periods});
                dispatch({type: listTrainingPeriods, id: selectedUser, data: d.training_periods});
            });
        }
    }

    public static goals(id?) {
        return (dispatch, getState) => {
            let selectedUser = id || getState().root.selected_user_id;
            jQuery.ajax({
                url: `/api/user/${selectedUser}/goal/`,
                type: 'GET',
                contentType: 'application/json',
                dataType: 'json'
            }).then(d => dispatch({type: listGoals, id: selectedUser, data: d.goals}));
        }
    }

    public static programs(id?) {
        return (dispatch, getState) => {
            let selectedUser = id || getState().root.selected_user_id;
            jQuery.ajax({
                url: `/api/user/${selectedUser}/program/`,
                type: 'GET',
                contentType: 'application/json',
                dataType: 'json'
            }).then(d => dispatch({type: listPrograms, id: selectedUser, data: d.programs}));
        }
    }

    public static trainerRequests() {
        return dispatch => {
            jQuery.ajax({
                url: `/api/trainer_request/`,
                type: 'GET',
                contentType: 'application/json',
                dataType: 'json'
            }).then(d => dispatch({type: listTrainerRequests, data: d.trainer_requests}));
        }
    }

    public static achievements = class {

        public static strength(id?: Number) {
            return (dispatch, getState) => {
                let selectedUser = id || getState().root.selected_user_id;
                return jQuery.ajax({
                    url: `/api/user/${selectedUser}/strength_achievement/`,
                    type: 'GET',
                    contentType: 'application/json',
                    dataType: 'json'
                }).then(d => dispatch({type: listStrengths, id: selectedUser, data: d.strength_achievements}));
            }
        }

        public static endurance(id?: Number) {
            return (dispatch, getState) => {
                let selectedUser = id || getState().root.selected_user_id;
                return jQuery.ajax({
                    url: `/api/user/${selectedUser}/endurance_achievement/`,
                    type: 'GET',
                    contentType: 'application/json',
                    dataType: 'json'
                }).then(d => dispatch({type: listEndurances, id: selectedUser, data: d.endurance_achievements}));
            }
        }
    };

    public static measurements = class {

        public static weight(id?: Number) {
            return (dispatch, getState) => {
                let selectedUser = id || getState().root.selected_user_id;
                jQuery.ajax({
                    url: `/api/user/${selectedUser}/weight_measurement/`,
                    type: 'GET',
                    contentType: 'application/json',
                    dataType: 'json'
                }).then(d => dispatch({type: listWeights, data: d.weight_measurements}));
            }
        }

        public static bodyfat(id?) {
            return (dispatch, getState) => {
                let selectedUser = id || getState().root.selected_user_id;
                jQuery.ajax({
                    url: `/api/user/${selectedUser}/bodyfat_measurement/`,
                    type: 'GET',
                    contentType: 'application/json',
                    dataType: 'json'
                }).then(d => dispatch({type: listBodyfats, data: d.bodyfat_measurements}));
            }
        }

        public static girth(id?) {
            return (dispatch, getState) => {
                let selectedUser = id || getState().root.selected_user_id;
                jQuery.ajax({
                    url: `/api/user/${selectedUser}/girth_measurement/`,
                    type: 'GET',
                    contentType: 'application/json',
                    dataType: 'json'
                }).then(d => dispatch({type: listGirths, data: d.girth_measurements}));
            }
        }
    };

    public static calories = class {
        public static intake(id?) {
            return (dispatch, getState) => {
                let selectedUser = id || getState().root.selected_user_id;
                jQuery.ajax({
                    url: `/api/user/${selectedUser}/calorie_intake/`,
                    type: 'GET',
                    contentType: 'application/json',
                    dataType: 'json'
                }).then(d => dispatch({type: listIntakes, id: selectedUser, data: d.calorie_intakes}));
            }
        }

        public static expenditure(id?) {
            return (dispatch, getState) => {
                let selectedUser = id || getState().root.selected_user_id;
                jQuery.ajax({
                    url: `/api/user/${selectedUser}/calorie_expenditure/`,
                    type: 'GET',
                    contentType: 'application/json',
                    dataType: 'json'
                }).then(d => dispatch({type: listExpenditures, id: selectedUser, data: d.calorie_expenditures}));
            }
        }
    };

    public static periods = class {
        public static diet(id?) {
            return (dispatch, getState) => {
                let selectedUser = id || getState().root.selected_user_id;
                jQuery.ajax({
                    url: `/api/user/${selectedUser}/diet_period/`,
                    type: 'GET',
                    contentType: 'application/json',
                    dataType: 'json'
                }).then(d => dispatch({type: listDietPeriods, id: selectedUser, data: d.diet_periods}));
            }
        }

        public static training(id?) {
            return (dispatch, getState) => {
                let selectedUser = id || getState().root.selected_user_id;
                jQuery.ajax({
                    url: `/api/user/${selectedUser}/training_period/`,
                    type: 'GET',
                    contentType: 'application/json',
                    dataType: 'json'
                }).then(d => dispatch({type: listTrainingPeriods, id: selectedUser, data: d.training_periods}));
            }
        }
    }
}

export const listReducer = (state: IUser | User, action: { type: string, data: any[] }) => {
    let newUser = new User(state);
    switch (action.type) {
        case listGoals:
            action.data.forEach(d => newUser.goals[d.id] = new Goal(d));
            return newUser;
        case listStrengths:
            action.data.forEach(d => newUser.strength_achievements[d.id] = new StrengthAchievement(d));
            return newUser;
        case listEndurances:
            action.data.forEach(d => newUser.endurance_achievements[d.id] = new EnduranceAchievement(d));
            return newUser;
        case listWeights:
            action.data.forEach(d => newUser.weight_measurements[d.id] = new WeightMeasurement(d));
            return newUser;
        case listBodyfats:
            action.data.forEach(d => newUser.bodyfat_measurements[d.id] = new BodyfatMeasurement(d));
            return newUser;
        case listGirths:
            action.data.forEach(d => newUser.girth_measurements[d.id] = new GirthMeasurement(d));
            return newUser;
        case listIntakes:
            action.data.forEach(d => newUser.calorie_intakes[d.id] = new CalorieIntake(d));
            return newUser;
        case listExpenditures:
            action.data.forEach(d => newUser.calorie_expenditures[d.id] = new CalorieExpenditure(d));
            return newUser;
        case listDietPeriods:
            action.data.forEach(d => newUser.diet_periods[d.id] = new DietPeriod(d));
            return newUser;
        case listTrainingPeriods:
            action.data.forEach(d => newUser.training_periods[d.id] = new TrainingPeriod(d));
            return newUser;
        case listTrainerRequests:
            action.data.forEach(d => newUser.trainer_requests[d.id] = new TrainerRequest(d));
            return newUser;
        default:
            return state || newUser;
    }
};