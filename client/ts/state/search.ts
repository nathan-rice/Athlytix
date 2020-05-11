export interface IQueryParams {
    query?: string;
    limit?: number;
    offset?: number;
}

export interface ILocationQueryParams {
    country?: string;
    state?: string
    city?: string
}

export interface IPersonQueryParams {
    first_name?: string;
    last_name?: string;
    gender?: string
}

const requestParams = {
    type: 'GET',
    contentType: 'application/json',
};

const postRequestParams = {
    ...requestParams,
    type: 'POST',
    dataType: 'json'
};

export class Search {

    public static exercise = class {
        public static strength(params: IQueryParams) {
            return jQuery.ajax({
                ...postRequestParams,
                url: `/api/search/exercise/strength/`,
                data: JSON.stringify(params),
            }).then(d => d.results);
        }

        public static endurance(params: IQueryParams) {
            return jQuery.ajax({
                ...postRequestParams,
                url: `/api/search/exercise/endurance/`,
                data: JSON.stringify(params),
            }).then(d => d.results);
        }
    };

    public static program(params: IQueryParams | { tags: string[] }) {
        return jQuery.ajax({
            ...postRequestParams,
            url: '/api/search/program/',
            data: JSON.stringify(params)
        }).then(d => d.results);
    }

    public static trainer(params: IQueryParams) {
        return jQuery.ajax({
            ...postRequestParams,
            url: '/api/search/trainer/',
            data: JSON.stringify(params)
        }).then(d => d.results)
    }

    public static user = class {
        public static name_ = class {
            public static first(params: IQueryParams & ILocationQueryParams & IPersonQueryParams) {
                return jQuery.ajax({
                    ...postRequestParams,
                    url: `/api/search/user/name/first/`,
                    data: JSON.stringify(params),
                }).then(d => d.results);
            }

            public static last(params: IQueryParams & ILocationQueryParams & IPersonQueryParams) {
                return jQuery.ajax({
                    ...postRequestParams,
                    url: `/api/search/user/name/last/`,
                    data: JSON.stringify(params),
                }).then(d => d.results);
            }
        }
    };

    public static calorie = class {
        public static intake(user_id, params: IQueryParams) {
            return jQuery.ajax({
                ...postRequestParams,
                url: `/api/search/calorie/intake/${user_id}/`,
                data: JSON.stringify(params),
            }).then(d => d.results);
        }

        public static expenditure(user_id, params: IQueryParams) {
            return jQuery.ajax({
                ...postRequestParams,
                url: `/api/search/calorie/expenditure/${user_id}/`,
                data: JSON.stringify(params),
            }).then(d => d.results);
        }
    };

    public static location = class {
        public static city(params: IQueryParams) {
            return jQuery.ajax({
                url: '/api/search/city/',
                type: 'POST',
                data: JSON.stringify(params),
                contentType: 'application/json',
                dataType: 'json'
            }).then(d => d.results);
        }

        public static state(params: IQueryParams) {
            return jQuery.ajax({
                url: '/api/search/state/',
                type: 'POST',
                data: JSON.stringify(params),
                contentType: 'application/json',
                dataType: 'json'
            }).then(d => d.results);
        }

        public static country(params: IQueryParams) {
            return jQuery.ajax({
                url: '/api/search/country/',
                type: 'POST',
                data: JSON.stringify(params),
                contentType: 'application/json',
                dataType: 'json'
            }).then(d => d.results);
        }
    }

}