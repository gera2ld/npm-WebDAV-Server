import { IResource, ReturnCallback } from '../resource/Resource'
import { WebDAVServer } from '../server/WebDAVServer'
import { FSPath } from '../manager/FSManager'
import * as http from 'http'
import * as url from 'url'

export let HTTPCodes = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    OK: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    MultipleChoices: 300,
    MovedPermanently: 301,
    MovedTemporarily: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    TemporaryRedirect: 307,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    RequestEntityTooLarge: 413,
    RequestURITooLarge: 414,
    UnsupportedMediaType: 415,
    RequestedRangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    UnorderedCollection: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HTTPVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    BandwidthLimitExceeded: 509,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511
};

export class MethodCallArgs
{
    contentLength : number
    depth : number
    host : string
    path : FSPath
    uri : string
    
    data : string

    constructor(
        public server : WebDAVServer,
        public request : http.IncomingMessage,
        public response : http.ServerResponse,
        public callback : () => void
    ) {
        this.contentLength = parseInt(this.findHeader('Content-length', '0'), 10);
        this.depth = parseInt(this.findHeader('Depth', '0'), 10);
        this.host = this.findHeader('Host');
        
        this.uri = url.parse(request.url).pathname;
        this.path = new FSPath(this.uri);
    }

    findHeader(name : string, defaultValue : string = null) : string
    {
        name = name.replace(/(-| )/g, '').toLowerCase();

        for(let k in this.request.headers)
            if(k.replace(/(-| )/g, '').toLowerCase() === name)
                return this.request.headers[k];
        
        return defaultValue;
    }

    getResource(callback : ReturnCallback<IResource>)
    {
        this.server.getResourceFromPath(this.uri, callback);
    }

    dateISO8601(ticks : number) : string
    {
        // Adding date
        const date = new Date(ticks);
        let result = date.toISOString().substring(0, '0000-00-00T00:00:00'.length);
        
        // Adding timezone offset
        let offset = date.getTimezoneOffset();
        result += offset < 0 ? '-' : '+'
        offset = Math.abs(offset)

        let h = Math.ceil(offset / 60).toString(10);
        while(h.length < 2)
            h = '0' + h;

        let m = (offset % 60).toString(10);
        while(m.length < 2)
            m = '0' + m;
            
        result += h + ':' + m;
        
        return result;
    }

    fullUri(uri : string = null)
    {
        if(!uri)
            uri = this.uri;
        
        return this.prefixUri() + uri.replace(/\/\//g, '/');
    }

    prefixUri()
    {
        return 'http://' + this.host.replace('/', '');
    }

    getResourcePath(resource : IResource, callback : ReturnCallback<string>)
    {
        if(!resource.parent)
            callback(null, '/');
        else
            resource.webName((e, name) => {
                this.getResourcePath(resource.parent, (e, parentName) => {
                    callback(e, parentName.replace(/\/$/, '') + '/' + name);
                })
            })
    }
    
    setCode(code : number, message ?: string)
    {
        if(!message)
            message = http.STATUS_CODES[code];
        if(!message)
        {
            this.response.statusCode = code;
        }
        else
        {
            this.response.statusCode = code;
            this.response.statusMessage = message;
        }
    }
}

export interface WebDAVRequest
{
    (arg : MethodCallArgs, callback : () => void) : void

    chunked ?: boolean
}
