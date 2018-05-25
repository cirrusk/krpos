export class RestrictionModel {
    image: string;
    message: string;
    desc: string;

    constructor(_image?: string, _message?: string, _desc?: string) {
        this.image = _image;
        this.message = _message;
        this.desc = _desc;
    }
}
