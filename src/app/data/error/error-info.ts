import { Error } from './error';
import { Errors } from './errors';
export class ErrorInfo {
    error: Error;
    errors: Errors[];
    message: string;
    name: string;
    ok: boolean;
    status: number;
    statusText: string;
    url: string;
}
