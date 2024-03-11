export type JSONRequestMiddleware = (request: Request, next: (request: Request) => Promise<any>) => Promise<any>;

export default class JSONClient {
    constructor(baseUrl: string, middleware?: JSONRequestMiddleware);

    readonly baseUrl: string;

    request<T = any>(request: string | URL | Request, options?: RequestInit): Promise<T>;
    get<T = any>(path: string, options?: RequestInit): Promise<T>;
    post<T = any>(path: string, body?: any, options?: RequestInit): Promise<T>;
    put<T = any>(path: string, body?: any, options?: RequestInit): Promise<T>;
    patch<T = any>(path: string, body?: any, options?: RequestInit): Promise<T>;
    delete<T = any>(path: string, body?: any, options?: RequestInit): Promise<T>;
}
