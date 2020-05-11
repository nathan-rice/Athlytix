import * as jQuery from 'jquery';
import {branches} from "./common";
import {
    IBodyfatMeasurement,
    ICalorieData,
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
    User
} from "../models";

const
    delStrength = `${branches.del}:STRENGTH`,
    delEndurance = `${branches.del}:ENDURANCE`,
    delWeight = `${branches.del}:WEIGHT`,
    delBodyfat = `${branches.del}:BODYFAT`,
    delGirth = `${branches.del}:GIRTH`,
    delIntake = `${branches.del}:INTAKE`,
    delExpenditure = `${branches.del}:EXPENDITURE`,
    delGoal = `${branches.del}:GOAL`,
    delDietPeriod = `${branches.del}:DIET_PERIOD`,
    delTrainingPeriod = `${branches.del}:TRAINING_PERIOD`,
    delProgram = `${branches.del}:PROGRAM`,
    delTrainerRequest = `${branches.del}:TRAINER_REQUEST`;

export class DelActions {

    public static goal(g: IGoal) {
        return dispatch => {
            return jQuery.ajax({
                url: `/api/goal/${g.id}/`,
                type: 'DELETE',
                contentType: 'application/json',
            }).then(d => d.deleted > 0 && dispatch({type: delGoal, id: g.id, data: {user_id: g.user_id}}));
        }
    }

    public static trainerRequest(r: ITrainerRequest) {
        return dispatch => {
            return jQuery.ajax({
                url: `/api/trainer_request/${r.id}/`,
                type: 'DELETE',
                contentType: 'application/json',
            }).then(d => d.deleted > 0 &&
                dispatch({type: delTrainerRequest, id: r.id, data: {user_id: r.user_id}}));
        }
    }

    public static program(p: IProgram) {
        return dispatch => {
            return jQuery.ajax({
                url: `/api/program/${p.id}/`,
                type: 'DELETE',
                contentType: 'application/json',
            }).then(d => d.deleted > 0 && dispatch({type: delProgram, id: p.id, data: {user_id: p.user_id}}));
        }
    }

    public static achievement = class {

        public static strength(a: IStrengthAchievement) {
            return dispatch => {
                return jQuery.ajax({
                    url: `/api/strength_achievement/${a.id}/`,
                    type: 'DELETE',
                    contentType: 'application/json',
                }).then(d => {
                    return d.deleted && dispatch({type: delStrength, id: a.id, data: {user_id: a.user_id}})
                });
            }
        }

        public static endurance(a: IEnduranceAchievement) {
            return dispatch => {
                return jQuery.ajax({
                    url: `/api/endurance_achievement/${a.id}/`,
                    type: 'DELETE',
                    contentType: 'application/json',
                }).then(d => {
                    return d.deleted && dispatch({type: delEndurance, id: a.id, data: {user_id: a.user_id}})
                });
            }
        }
    };

    public static measurement = class {

        public static weight(m: IWeightMeasurement) {
            return dispatch => {
                return jQuery.ajax({
                    url: `/api/weight_measurement/${m.id}/`,
                    type: 'DELETE',
                    contentType: 'application/json',
                }).then(d => {
                    return d.deleted && dispatch({type: delWeight, id: m.id, data: {user_id: m.user_id}})
                });
            }
        }

        public static bodyfat(m: IBodyfatMeasurement) {
            return dispatch => {
                return jQuery.ajax({
                    url: `/api/bodyfat_measurement/${m.id}/`,
                    type: 'DELETE',
                    contentType: 'application/json',
                }).then(d => {
                    return d.deleted && dispatch({type: delBodyfat, id: m.id, data: {user_id: m.user_id}})
                });
            }
        }

        public static girth(m: IGirthMeasurement) {
            return dispatch => {
                return jQuery.ajax({
                    url: `/api/girth_measurement/${m.id}/`,
                    type: 'DELETE',
                    contentType: 'application/json',
                }).then(d => {
                    return d.deleted && dispatch({type: delGirth, id: m.id, data: {user_id: m.user_id}})
                });
            }
        }
    };

    public static calorie = class {

        public static intake(c: ICalorieData) {
            return dispatch => {
                return jQuery.ajax({
                    url: `/api/calorie_intake/${c.id}/`,
                    type: 'DELETE',
                    contentType: 'application/json',
                }).then(d => {
                    return d.deleted && dispatch({type: delIntake, id: c.id, data: {user_id: c.user_id}})
                });
            }
        }

        public static expenditure(c: ICalorieData) {
            return dispatch => {
                return jQuery.ajax({
                    url: `/api/calorie_expenditure/${c.id}/`,
                    type: 'DELETE',
                    contentType: 'application/json',
                }).then(d => {
                    return d.deleted && dispatch({type: delExpenditure, id: c.id, data: {user_id: c.user_id}})
                });
            }
        }
    };

    public static period = class {
        public static diet(c: IDietPeriod) {
            return dispatch => {
                return jQuery.ajax({
                    url: `/api/diet_period/${c.id}/`,
                    type: 'DELETE',
                    contentType: 'application/json',
                }).then(d => {
                    return d.deleted && dispatch({type: delDietPeriod, id: c.id, data: {user_id: c.user_id}})
                });
            }
        }

        public static training(c: ITrainingPeriod) {
            return dispatch => {
                return jQuery.ajax({
                    url: `/api/training_period/${c.id}/`,
                    type: 'DELETE',
                    contentType: 'application/json',
                }).then(d => {
                    return d.deleted && dispatch({type: delTrainingPeriod, id: c.id, data: {user_id: c.user_id}})
                });
            }
        }
    }
}

export const delReducer = (state: IUser | User, action: { type: string, id: number }) => {
    let newUser = new User(state);
    switch (action.type) {
        case delGoal:
            delete newUser.goals[action.id];
            return newUser;
        case delStrength:
            delete newUser.strength_achievements[action.id];
            return newUser;
        case delEndurance:
            delete newUser.endurance_achievements[action.id];
            return newUser;
        case delWeight:
            delete newUser.weight_measurements[action.id];
            return newUser;
        case delBodyfat:
            delete newUser.bodyfat_measurements[action.id];
            return newUser;
        case delGirth:
            delete newUser.girth_measurements[action.id];
            return newUser;
        case delIntake:
            delete newUser.calorie_intakes[action.id];
            return newUser;
        case delExpenditure:
            delete newUser.calorie_expenditures[action.id];
            return newUser;
        case delDietPeriod:
            delete newUser.diet_periods[action.id];
            return newUser;
        case delTrainingPeriod:
            delete newUser.training_periods[action.id];
            return newUser;
        case delTrainerRequest:
            delete newUser.trainer_requests[action.id];
            return newUser;
        default:
            return state || newUser;
    }
};