import { PhoneNumberMaskPipe } from './phone-number-mask.pipe';

describe('PhoneNumberMaskPipe', () => {
  it('create an instance', () => {
    const pipe = new PhoneNumberMaskPipe();
    expect(pipe).toBeTruthy();
  });
});
