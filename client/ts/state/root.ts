import {createStore, applyMiddleware, combineReducers, compose} from 'redux';
import {reducer as formReducer} from 'redux-form';
import ReduxThunk from 'redux-thunk';
import * as moment from 'moment';
import {Moment} from 'moment';
import {defaultUser, IUserState, userReducer} from "./user";
import {getDefaultView, ILogState, logReducer} from "./log";
import {IModalState, modalReducer} from "./modal";
import {defaultEstimateState, estimatesReducer, IEstimateState} from "./estimates";
import {ILeaderboardState, leaderboardReducer} from "./leaderboard";
import {defaultProgramState, IProgramState, programReducer} from "./program";
import {IWorkoutState, workoutReducer} from "./workout";
import {branches} from "./common";
import {addReducer} from "./add";
import {delReducer} from "./del";
import {listReducer} from "./list";

export interface IAppState {
    root: IRootState;
    form: Object;
}

export interface IRootState {
    user_id: number;
    selected_user_id: number;
    selected_date: Moment;
    users: IUserState;
    log: ILogState;
    modal: IModalState;
    estimates: IEstimateState;
    leaderboard: ILeaderboardState;
    program: IProgramState;
    workout: IWorkoutState;
}

const
    setUserId = 'USER_ID',
    selectDate = 'SELECT_DATE',
    selectUserId = "SELECT_USER_ID";

const createDefaultRootState = (): IRootState => {
    return {
        user_id: -1,
        selected_user_id: -1,
        selected_date: moment(),
        users: {"-1": defaultUser()},
        estimates: defaultEstimateState(),
        log: {days: {}, selected: null, view: getDefaultView()},
        modal: {type: null},
        leaderboard: {strength: {}, endurance: {}, bodyfat: [], weight_loss: [], weight_gain: []},
        program: defaultProgramState(),
        workout: {estimates: {}}
    }
};

const rootReducer = (state: IRootState, action): IRootState => {
    if (!state) state = createDefaultRootState();
    let branch = action.type.split(":")[0],
        applyToUser = (s, f) => {
            let user_id = (action.data && action.data.user_id) || s.selected_user_id,
                user = s.users[user_id],
                updatedUser = f(user, action);
            return {...s, users: {...s.users, [user_id]: updatedUser}};
        };
    switch (branch) {
        case branches.log:
            return {...state, log: logReducer(state.log, action)};
        case branches.modal:
            return {...state, modal: modalReducer(state.modal, action)};
        case branches.users:
            return {...state, users: userReducer(state.users, action)};
        case setUserId:
            return {...state, user_id: action.id};
        case selectUserId:
            return {...state, selected_user_id: action.id};
        case selectDate:
            return {...state, selected_date: action.date.clone()};
        case branches.add:
            return applyToUser(state, addReducer);
        case branches.del:
            return applyToUser(state, delReducer);
        case branches.list:
            return applyToUser(state, listReducer);
        case branches.estimates:
            return {...state, estimates: estimatesReducer(state.estimates, action)};
        case branches.leaderboard:
            return {...state, leaderboard: leaderboardReducer(state.leaderboard, action)};
        case branches.program:
            return {...state, program: programReducer(state.program, action)};
        case branches.workout:
            return {...state, workout: workoutReducer(state.workout, action)};
        default:
            return state;
    }
};

let defaultState = {};

const reducer = combineReducers({
    root: rootReducer,
    form: formReducer
});

export const store = () => {
    let composeEnhancers = typeof window === 'object' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    let enhancer = composeEnhancers(applyMiddleware(ReduxThunk));

    return createStore(reducer, defaultState, enhancer);
};