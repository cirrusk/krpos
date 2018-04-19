import { Errors } from './errors';

export class Error {
    error: string;
    error_description: string;
    errors: Errors[];
    constructor(error: string, error_description: string) {
        this.error = error;
        this.error_description = error_description;
    }
}
