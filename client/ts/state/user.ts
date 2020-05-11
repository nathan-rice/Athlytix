import * as jQuery from 'jquery';
import {ITrainerRequest, IUser, User} from "../models";
import {branches} from "./common";
import {xdate} from "../common";

export interface IUserState {
    [key: number]: User;
}

const
    setUserId = 'USER_ID',
    selectUserId = "SELECT_USER_ID",
    setClients = `${branches.users}:SET_CLIENTS`,
    addClient = `${branches.users}:ADD_CLIENTS`,
    removeClient = `${branches.users}:REMOVE_CLIENTS`,
    addUser = `${branches.users}:ADD`,
    addUsers = `${branches.users}:ADD_MULTIPLE`,
    removeUser = `${branches.users}:REMOVE`,
    updateUser = `${branches.users}:UPDATE`,
    delTrainerRequest = `${branches.del}:TRAINER_REQUEST`;


export class UserActions {

    public static current() {
        return dispatch => {
            return jQuery.ajax({
                url: `/api/current_user/`,
                type: 'GET',
                contentType: 'application/json',
                dataType: 'json'
            }).then(d => {
                dispatch({type: addUser, user: d.user});
                dispatch({type: setUserId, id: d.user.id});
                dispatch({type: selectUserId, id: d.user.id});
                return d.user;
            });
        }
    }

    public static create(u: IUser) {
        return dispatch => {
            return jQuery.ajax({
                url: `/api/user/`,
                type: "PUT",
                contentType: 'application/json',
                data: JSON.stringify(u),
                dataType: 'json'
            }).then(d => {
                dispatch({type: addUser, user: d.user});
                return dispatch({type: addClient, user: d.user})
            });
        }
    }

    public static get(u: IUser) {
        return dispatch => {
            return jQuery.ajax({
                url: `/api/user/${u.id}/`,
                type: "GET",
                contentType: 'application/json'
            }).then(d => dispatch({type: addUser, id: u.id, user: d.user}));
        }
    }

    public static update(u: IUser) {
        return dispatch => {
            return jQuery.ajax({
                url: `/api/user/${u.id}/`,
                type: "POST",
                contentType: 'application/json',
                data: JSON.stringify(u),
                dataType: 'json'
            }).then(d => dispatch({type: updateUser, user: d.user}));
        }
    }

    public static select(u: IUser) {
        return {type: selectUserId, id: u.id}
    }

    public static clients = class {

        public static add(u: IUser) {
            return dispatch => {
                return jQuery.ajax({
                    url: `/api/current_user/client/`,
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify(u)
                }).then(d => dispatch({type: addClient, user: d.user}))
            }
        }

        public static remove(u: IUser) {
            return dispatch => {
                return jQuery.ajax({
                    url: `/api/current_user/client/${u.id}/`,
                    type: 'DELETE',
                    contentType: 'application/json'
                }).then(d => {
                    dispatch({type: updateUser, user: d.user})
                    return dispatch({type: removeClient, trainer_id: u.trainer_id, user: d.user})
                })
            }
        }

        public static list() {
            return dispatch => {
                return jQuery.ajax({
                    url: `/api/current_user/client/`,
                    type: 'GET',
                    contentType: 'application/json',
                    dataType: 'json'
                }).then(d => {
                    dispatch({type: addUsers, users: d.users});
                    dispatch({type: setClients, users: d.users});
                });
            }
        }
    };

    public static approveTrainerRequest(r: ITrainerRequest) {
        return dispatch => {
            return jQuery.ajax({
                url: `/api/trainer_request/${r.id}/approve`,
                type: "GET",
                contentType: 'application/json'
            }).then(d => {
                dispatch({type: delTrainerRequest, id: r.id, data: {user_id: r.user_id}});
                return dispatch({type: addClient, user: d.user})
            });
        }
    }
}

export const userReducer = (state: IUserState, action): IUserState => {
    let clients, trainer_id, user: User;
    switch (action.type) {
        case addUser:
            let id = action.user ? action.user.id : action.id;
            if (!id) return state;
            return {...state, [id]: new User(action.user)};
        case updateUser:
            return {...state, [action.user.id]: new User({...state[action.user.id], ...action.user})};
        case addUsers:
            let users = action.users.reduce((obj, x) => {
                obj[x.id] = new User(x);
                return obj
            }, {});
            return {...state, ...users};
        case setClients:
            if (action.users.length > 0) {
                trainer_id = action.users[0].trainer_id;
                clients = Object.keys(action.users).map(k => action.users[k]);
                user = new User({...state[trainer_id], clients} as User);
                return {...state, [trainer_id]: user};
            } else return state;
        case addClient:
            trainer_id = action.user.trainer_id;
            clients = [...state[trainer_id].clients, action.user];
            user = new User({...state[trainer_id], clients} as User);
            return {...state, [trainer_id]: user};
        case removeClient:
            clients = state[action.trainer_id].clients.filter(u => u.id != action.user.id);
            return {
                ...state,
                [action.trainer_id]: new User({...state[action.trainer_id], clients} as User)
            };
        case removeUser:
            let newState = {...state};
            delete newState[action.user_id];
            return newState;
        default:
            return state || {}
    }
};

export const defaultUser = () => new User({id: -1, email: "", is_trainer: false, join_date: xdate()} as IUser);