import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { AsyncSubject, of, Subject } from 'rxjs';
import { AjaxHttpService } from '../http';
import { IHttpRequest, IHttpResponse } from '../types';

describe('AjaxHttpService', () => {
    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
    });

    it('should execute request and fail', (done) => {
        const service = new AjaxHttpService();
        const request: IHttpRequest = { url: '', method: '' };
        const response = { body: '', ok: false, status: 500, statusText: "Exception", url: '', };

        service.execute(request).subscribe({
            next: null!, error: (err) => {
                expect(err).toStrictEqual(response);
                done();
            }
        });
    });

    it('should execute GET request', (done) => {
        const open = jest.spyOn(XMLHttpRequest.prototype as any, 'open').mockImplementation(() => { });
        const event = {} as Event;
        const send = jest.spyOn(XMLHttpRequest.prototype as any, 'send').mockImplementation(() => {
            XMLHttpRequest.prototype.readyState === 4;
            XMLHttpRequest.prototype.onreadystatechange!(event);
        });
        const setRequestHeader = jest.spyOn(XMLHttpRequest.prototype as any, 'setRequestHeader').mockImplementation(() => { });
        const service = new AjaxHttpService();
        const request: IHttpRequest = { url: 'http://cloud.com', method: 'GET', headers: { foo: 'bar' }, body: 'BODY' };
        const response: IHttpResponse = { status: 200, ok: true, body: 'hello', url: request.url, statusText: 'welcome' };
        jest.spyOn(service as any, 'onResponse').mockImplementation((request, subject, x) => {
            (<Subject<IHttpResponse>>subject).next(response);
            (<Subject<IHttpResponse>>subject).complete();
        });

        service.execute(request).subscribe((val) => {
            expect(val).toStrictEqual(response);
            done();
        });
        expect(open).toHaveBeenCalledWith(request.method, request.url, true);
        expect(setRequestHeader).toHaveBeenCalledWith('foo', 'bar');
        expect(send).toHaveBeenCalledWith();
    });

    it('should execute POST request', (done) => {
        const open = jest.spyOn(XMLHttpRequest.prototype as any, 'open').mockImplementation(() => { });
        const event = {} as Event;
        const send = jest.spyOn(XMLHttpRequest.prototype as any, 'send').mockImplementation(() => {
            XMLHttpRequest.prototype.readyState === 4;
            XMLHttpRequest.prototype.onreadystatechange!(event);
        });
        const setRequestHeader = jest.spyOn(XMLHttpRequest.prototype as any, 'setRequestHeader').mockImplementation(() => { });
        const service = new AjaxHttpService();
        const request: IHttpRequest = { url: 'http://cloud.com', method: 'POST', headers: { foo: 'bar' }, body: 'BODY' };
        const response: IHttpResponse = { status: 200, ok: true, body: 'hello', url: request.url, statusText: 'welcome' };
        jest.spyOn(service as any, 'onResponse').mockImplementation((request, subject, x) => {
            (<Subject<IHttpResponse>>subject).next(response);
            (<Subject<IHttpResponse>>subject).complete();
        });

        service.execute(request).subscribe((val) => {
            expect(val).toStrictEqual(response);
            done();
        });
        expect(open).toHaveBeenCalledWith(request.method, request.url, true);
        expect(setRequestHeader).toHaveBeenCalledWith('foo', 'bar');
        expect(send).toHaveBeenCalledWith(request.body);
    });

    it('should emit response from right json', (done) => {
        const service = new AjaxHttpService();
        const httpRequest = { url: 'http://cloud.com' } as IHttpRequest;
        const subject = new AsyncSubject<IHttpResponse>();
        const xmlHttpRequest = { status: 200, responseText: '{"foo": "bar"}', getResponseHeader: (a) => 'application/json' } as XMLHttpRequest;
        const response: IHttpResponse = { status: xmlHttpRequest.status, body: { foo: 'bar' }, statusText: undefined!, ok: true, url: httpRequest.url };
        const logError = jest.spyOn(service as any, 'logError').mockImplementation(() => { });
        service['onResponse'](httpRequest, subject, xmlHttpRequest);
        subject.subscribe((val) => {
            expect(val).toStrictEqual(response);
            done();
        });
    });

    it('should emit response from wrong json', (done) => {
        const service = new AjaxHttpService();
        const httpRequest = { url: 'http://cloud.com' } as IHttpRequest;
        const subject = new AsyncSubject<IHttpResponse>();
        const xmlHttpRequest = { status: 200, responseText: 'foo', getResponseHeader: (a) => 'application/json' } as XMLHttpRequest;
        const response: IHttpResponse = { status: xmlHttpRequest.status, body: xmlHttpRequest.responseText, statusText: undefined!, ok: true, url: httpRequest.url };
        const logError = jest.spyOn(service as any, 'logError').mockImplementation(() => { });
        service['onResponse'](httpRequest, subject, xmlHttpRequest);
        subject.subscribe((val) => {
            expect(val).toStrictEqual(response);
            expect(logError).toHaveBeenCalledWith(`onResponse: Failed to parse JSON response for URL ${httpRequest.url}`, new SyntaxError('Unexpected token o in JSON at position 1'));
            done();
        });
    });

    it('should emit response from xml', (done) => {
        const service = new AjaxHttpService();
        const httpRequest = { url: 'http://cloud.com' } as IHttpRequest;
        const subject = new AsyncSubject<IHttpResponse>();
        const xmlHttpRequest = { status: 200, responseText: '<?xml version="1.0" encoding="UTF-8" ?><Root mcv="1.0"></Root> ', getResponseHeader: (a) => 'application/xml' } as XMLHttpRequest;
        const response: IHttpResponse = { status: xmlHttpRequest.status, body: xmlHttpRequest.responseText, statusText: undefined!, ok: true, url: httpRequest.url };
        service['onResponse'](httpRequest, subject, xmlHttpRequest);
        subject.subscribe((val) => {
            expect(val).toStrictEqual(response);
            done();
        });
    });
});