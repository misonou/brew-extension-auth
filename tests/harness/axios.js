import { mockFn } from "@misonou/test-utils";
import axios, { AxiosError } from "axios";

class MockError extends Error {
    constructor(config, status, data) {
        super('');
        this.payload = {
            data,
            status,
            statusText: '',
            headers: {},
            config,
            isMock: true
        };
    }
}

export const onAxiosRequest = mockFn(createFakeResponse(200));

export function createFakeResponse(status, data = {}) {
    return config => {
        return Promise.reject(new MockError(config, status, data));
    };
}

const originalCreate = axios.create;
axios.create = function create(config) {
    const axios = originalCreate(config);
    axios.interceptors.request.use(onAxiosRequest);
    axios.interceptors.response.use(undefined, error => {
        if (error instanceof MockError) {
            if (error.payload.status && String(error.payload.status)[0] !== '2') {
                return Promise.reject(new AxiosError('', '', error.payload.config, undefined, error.payload));
            }
            return Promise.resolve(error.payload);
        }
        return Promise.reject(error);
    });
    axios.create = create;
    return axios;
};

export function createAxios(config = {}) {
    return axios.create(config);
}
