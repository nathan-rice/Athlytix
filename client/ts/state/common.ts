import {IDatedRecord, IUser} from "../models";
import {xdate} from "../common";

export const branches = {
    users: "USER",
    log: "LOG",
    modal: "MODAL",
    add: "ADD",
    list: "LIST",
    del: "DELETE",
    estimates: "ESTIMATE",
    leaderboard: "LEADERBOARD",
    program: "PROGRAM",
    workout: "WORKOUT"
};

export const selectDate = 'SELECT_DATE';

export const autopopulate = (d: IDatedRecord | null, getState) => {
    let user_id = d && d.user_id || getState().root.selected_user_id || getState().root.user_id,
        date = d && d.date || getState().root.selected_date || xdate();
    return {...d, user_id, date};
};

export const appendLocationToUrl = (url, u: IUser) => {
    if (u.country) {
        url += `${u.country}/`;
        if (u.state) {
            url += `${u.state}/`;
            if (u.city) url += `${u.city}`;
        }
    }
    return url;
};

export const requestParams = {
    type: 'GET',
    contentType: 'application/json',
};

export const postRequestParams = {
    ...requestParams,
    type: 'POST',
    dataType: 'json'
};