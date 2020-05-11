import * as jQuery from 'jquery';
import {branches} from "./common";

const workoutWeights = `${branches.workout}:WEIGHTS`;

export interface IWorkoutState {
    estimates: { [exercise: string]: number }
}

export class WorkoutActions {
    public static estimates(user_id, period_id, workout_id) {
        return (dispatch, getState) => {
            return jQuery.ajax({
                url: `/api/estimate/${user_id}/workout/${period_id}/${workout_id}/`,
                type: 'GET',
                contentType: 'application/json',
            }).then(d => dispatch({type: workoutWeights, estimates: d.estimates}));
        }
    }
}

export const workoutReducer = (state: IWorkoutState, action): IWorkoutState => {
    switch (action.type) {
        case workoutWeights:
            return {estimates: action.estimates};
        default:
            return state;
    }
};