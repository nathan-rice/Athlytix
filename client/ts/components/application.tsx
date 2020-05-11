import * as React from 'react';
import {Header} from './header';
import {ModalContainer} from './modals';
import {Provider} from 'react-redux';
import {Router} from 'react-router-dom';
import {Routes} from './routes';
import * as ReactGA from 'react-ga';
import createBrowserHistory from "history/createBrowserHistory";

declare const PRODUCTION: boolean;
const history = createBrowserHistory();

if (PRODUCTION) {
    ReactGA.initialize('UA-106249867-1');

    const logPageView = () => {
        ReactGA.set({page: window.location.pathname + window.location.search});
        ReactGA.pageview(window.location.pathname + window.location.search);
    };

    history.listen(logPageView);
}

export const Application = ({store}) => {
    return (
        <Provider store={store}>
            <Router history={history}>
                <div id="application-root">
                    <ModalContainer/>
                    <Header/>
                    <Routes/>
                </div>
            </Router>
        </Provider>
    );
};