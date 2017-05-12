/// <reference types="node" />
import { IResource, ReturnCallback } from '../resource/Resource';
import { WebDAVServer } from '../server/WebDAVServer';
import { FSPath } from '../manager/FSManager';
import * as http from 'http';
export declare let HTTPCodes: {
    Continue: number;
    SwitchingProtocols: number;
    Processing: number;
    OK: number;
    Created: number;
    Accepted: number;
    NonAuthoritativeInformation: number;
    NoContent: number;
    ResetContent: number;
    PartialContent: number;
    MultiStatus: number;
    MultipleChoices: number;
    MovedPermanently: number;
    MovedTemporarily: number;
    SeeOther: number;
    NotModified: number;
    UseProxy: number;
    TemporaryRedirect: number;
    BadRequest: number;
    Unauthorized: number;
    PaymentRequired: number;
    Forbidden: number;
    NotFound: number;
    MethodNotAllowed: number;
    NotAcceptable: number;
    ProxyAuthenticationRequired: number;
    RequestTimeout: number;
    Conflict: number;
    Gone: number;
    LengthRequired: number;
    PreconditionFailed: number;
    RequestEntityTooLarge: number;
    RequestURITooLarge: number;
    UnsupportedMediaType: number;
    RequestedRangeNotSatisfiable: number;
    ExpectationFailed: number;
    ImATeapot: number;
    UnprocessableEntity: number;
    Locked: number;
    FailedDependency: number;
    UnorderedCollection: number;
    UpgradeRequired: number;
    PreconditionRequired: number;
    TooManyRequests: number;
    RequestHeaderFieldsTooLarge: number;
    InternalServerError: number;
    NotImplemented: number;
    BadGateway: number;
    ServiceUnavailable: number;
    GatewayTimeout: number;
    HTTPVersionNotSupported: number;
    VariantAlsoNegotiates: number;
    InsufficientStorage: number;
    BandwidthLimitExceeded: number;
    NotExtended: number;
    NetworkAuthenticationRequired: number;
};
export declare class MethodCallArgs {
    server: WebDAVServer;
    request: http.IncomingMessage;
    response: http.ServerResponse;
    callback: () => void;
    contentLength: number;
    depth: number;
    host: string;
    path: FSPath;
    uri: string;
    data: string;
    constructor(server: WebDAVServer, request: http.IncomingMessage, response: http.ServerResponse, callback: () => void);
    findHeader(name: string, defaultValue?: string): string;
    getResource(callback: ReturnCallback<IResource>): void;
    dateISO8601(ticks: number): string;
    fullUri(uri?: string): string;
    prefixUri(): string;
    getResourcePath(resource: IResource, callback: ReturnCallback<string>): void;
    setCode(code: number, message?: string): void;
}
export interface WebDAVRequest {
    (arg: MethodCallArgs, callback: () => void): void;
    chunked?: boolean;
}
