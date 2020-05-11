import * as React from 'react';
import {Actions} from "../../../state/actions";
import {Glyphicon} from "react-bootstrap";

export const mediaFormat = dispatch => {
    return link => {
        let click = e => {
            e.preventDefault();
            dispatch(Actions.modal.media(link));
        };
        if (link) {
            return <a href="" onClick={click}><Glyphicon glyph="play-circle"/></a>
        } else return "";
    };
};