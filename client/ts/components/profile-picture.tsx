import * as React from 'react';
import * as Gravatar from 'react-gravatar';

export const ProfilePicture = ({user, size}) => {
    if (user && user.facebook_id) {
        let url = `https://graph.facebook.com/${user.facebook_id}/picture?width=${size}&height=${size}`;
        return <img src={url}/>;
    }
    else {
        let email = user && user.email || "";
        return <Gravatar email={email} default="mm" size={size}/>;
    }
};
