import * as jQuery from 'jquery';
import * as moment from 'moment';
import {
    BodyfatMeasurement,
    CalorieExpenditure,
    CalorieIntake,
    DietPeriod,
    EnduranceAchievement,
    GirthMeasurement,
    Goal,
    IBodyfatMeasurement,
    ICalorieExpenditure,
    ICalorieIntake,
    IDietPeriod,
    IEnduranceAchievement,
    IGirthMeasurement,
    IGoal,
    IProgram,
    IStrengthAchievement,
    ITrainerRequest,
    ITrainingPeriod,
    IUser,
    IWeightMeasurement,
    StrengthAchievement,
    TrainerRequest,
    TrainingPeriod,
    User,
    WeightMeasurement
} from "../models";
import {branches} from "./common";
import {xdate} from "../common";

const
    addStrength = `${branches.add}:STRENGTH`,
    addEndurance = `${branches.add}:ENDURANCE`,
    addWeight = `${branches.add}:WEIGHT`,
    addBodyfat = `${branches.add}:BODYFAT`,
    addGirth = `${branches.add}:GIRTH`,
    addIntake = `${branches.add}:INTAKE`,
    addExpenditure = `${branches.add}:EXPENDITURE`,
    addGoal = `${branches.add}:GOAL`,
    addDietPeriod = `${branches.add}:DIET_PERIOD`,
    addTrainingPeriod = `${branches.add}:TRAINING_PERIOD`,
    addProgram = `${branches.add}:PROGRAM`,
    addTrainerRequest = `${branches.add}:TRAINER_REQUEST`;

export class AddActions {
    public static goal(g: IGoal) {
        return (dispatch, getState) => {
            let selectedUser = g.user_id || getState().root.selected_user_id;
            return jQuery.ajax({
                url: `/api/user/${selectedUser}/goal/`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(g),
                dataType: 'json'
            }).then(d => dispatch({type: addGoal, data: d.goal}));
        }
    }

    public static trainerRequest(r: ITrainerRequest) {
        return (dispatch, getState) => {
            let selectedUser = r.user_id || getState().root.user_id;
            r.date = xdate();
            return jQuery.ajax({
                url: `/api/user/${selectedUser}/trainer_request/`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(r),
                dataType: 'json'
            }).then(d => dispatch({type: addTrainerRequest, data: d.trainer_request}));
        }
    }

    public static program(p: IProgram) {
        return (dispatch, getState) => {
            let selectedUser = p.user_id || getState().root.selected_user_id;
            return jQuery.ajax({
                url: `/api/user/${selectedUser}/program/`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(p),
                dataType: 'json'
            }).then(d => {
                return dispatch({type: addProgram, data: d.program});
            });
        }
    }

    public static achievement = class {
        public static strength(a: IStrengthAchievement) {
            return (dispatch, getState) => {
                let selectedUser = a.user_id || getState().root.selected_user_id;
                return jQuery.ajax({
                    url: `/api/user/${selectedUser}/strength_achievement/`,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(a),
                    dataType: 'json'
                }).then(d => dispatch({type: addStrength, data: d.strength_achievement}));
            }
        }

        public static endurance(a: IEnduranceAchievement) {
            return (dispatch, getState) => {
                let selectedUser = a.user_id || getState().root.selected_user_id;
                if (typeof a.time == "string") a.time = moment.duration(a.time).asSeconds();
                return jQuery.ajax({
                    url: `/api/user/${selectedUser}/endurance_achievement/`,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(a),
                    dataType: 'json'
                }).then(d => dispatch({type: addEndurance, data: d.endurance_achievement}));
            }
        }
    };

    public static measurement = class {
        public static weight(m: IWeightMeasurement) {
            return (dispatch, getState) => {
                let selectedUser = m.user_id || getState().root.selected_user_id;
                return jQuery.ajax({
                    url: `/api/user/${selectedUser}/weight_measurement/`,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(m),
                    dataType: 'json'
                }).then(d => dispatch({type: addWeight, data: d.weight_measurement}));
            }
        }


        public static bodyfat(m: IBodyfatMeasurement) {
            return (dispatch, getState) => {
                let selectedUser = m.user_id || getState().root.selected_user_id;
                return jQuery.ajax({
                    url: `/api/user/${selectedUser}/bodyfat_measurement/`,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(m),
                    dataType: 'json'
                }).then(d => dispatch({type: addBodyfat, data: d.bodyfat_measurement}));
            }
        }


        public static girth(m: IGirthMeasurement) {
            return (dispatch, getState) => {
                let selectedUser = m.user_id || getState().root.selected_user_id;
                return jQuery.ajax({
                    url: `/api/user/${selectedUser}/girth_measurement/`,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(m),
                    dataType: 'json'
                }).then(d => dispatch({type: addGirth, data: d.girth_measurement}));
            }
        }
    };

    public static calorie = class {

        public static intake(c: ICalorieIntake) {
            return (dispatch, getState) => {
                let selectedUser = c.user_id || getState().root.selected_user_id;
                return jQuery.ajax({
                    url: `/api/user/${selectedUser}/calorie_intake/`,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(c),
                    dataType: 'json'
                }).then(d => dispatch({type: addIntake, data: d.calorie_intake}));
            }
        }

        public static expenditure(c: ICalorieExpenditure) {
            return (dispatch, getState) => {
                let selectedUser = c.user_id || getState().root.selected_user_id;
                return jQuery.ajax({
                    url: `/api/user/${selectedUser}/calorie_expenditure/`,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(c),
                    dataType: 'json'
                }).then(d => dispatch({type: addExpenditure, data: d.calorie_expenditure}));
            }
        }
    };

    public static period = class {
        public static diet(c: IDietPeriod) {
            return (dispatch, getState) => {
                let selectedUser = c.user_id || getState().root.selected_user_id;
                return jQuery.ajax({
                    url: `/api/user/${selectedUser}/diet_period/`,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(c),
                    dataType: 'json'
                }).then(d => dispatch({type: addDietPeriod, data: d.diet_period}));
            }
        };

        public static training(c: ITrainingPeriod) {
            return (dispatch, getState) => {
                let selectedUser = c.user_id || getState().root.selected_user_id;
                return jQuery.ajax({
                    url: `/api/user/${selectedUser}/training_period/`,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(c),
                    dataType: 'json'
                }).then(d => dispatch({type: addTrainingPeriod, data: d.training_period}));
            }
        };
    };
}

export const addReducer = (state: IUser | User, action) => {
    let newUser = new User(state);
    switch (action.type) {
        case addGoal:
            newUser.goals[action.data.id] = new Goal(action.data);
            return newUser;
        case addStrength:
            newUser.strength_achievements[action.data.id] = new StrengthAchievement(action.data);
            return newUser;
        case addEndurance:
            newUser.endurance_achievements[action.data.id] = new EnduranceAchievement(action.data);
            return newUser;
        case addWeight:
            newUser.weight_measurements[action.data.id] = new WeightMeasurement(action.data);
            return newUser;
        case addBodyfat:
            newUser.bodyfat_measurements[action.data.id] = new BodyfatMeasurement(action.data);
            return newUser;
        case addGirth:
            newUser.girth_measurements[action.data.id] = new GirthMeasurement(action.data);
            return newUser;
        case addIntake:
            newUser.calorie_intakes[action.data.id] = new CalorieIntake(action.data);
            return newUser;
        case addExpenditure:
            newUser.calorie_expenditures[action.data.id] = new CalorieExpenditure(action.data);
            return newUser;
        case addDietPeriod:
            newUser.diet_periods[action.data.id] = new DietPeriod(action.data);
            return newUser;
        case addTrainingPeriod:
            newUser.training_periods[action.data.id] = new TrainingPeriod(action.data);
            return newUser;
        case addProgram:
            Object.keys(newUser.training_periods).forEach(k => {
                let tp = newUser.training_periods[k],
                    program = action.data;
                if (tp.program && tp.program.id == program.id) {
                    let newPeriod = new TrainingPeriod({...tp, program});
                    newUser.training_periods[k] = newPeriod;
                }
            });
            return newUser;
        case addTrainerRequest:
            newUser.trainer_requests[action.data.id] = new TrainerRequest(action.data);
            return newUser;
        default:
            return state || newUser;
    }
};