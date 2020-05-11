import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from 'jquery';
import {Actions} from './state/actions';
import {store} from './state/root';
import {Application} from './components/application';
import 'react-dates/lib/css/_datepicker.css';
import 'react-select/dist/react-select.css';
import 'react-treeview/react-treeview.css';


let s = store(); 

let promise: any = s.dispatch(Actions.user.current());

promise.then(u => {
    if (u.is_trainer) s.dispatch(Actions.user.clients.list());
    s.dispatch(Actions.list.trainerRequests());
    s.dispatch(Actions.list.all(u.id));
});

$(window).on("focus", () => {
    s.dispatch(Actions.list.calories.intake());
});

ReactDOM.render(
    <Application store={s}/>,
    document.getElementById("main")
);