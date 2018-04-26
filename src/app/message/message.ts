import { InjectionToken } from '@angular/core';

import { LANG_KO_NAME, LANG_KO_MSGS } from './msg-ko';

export const MESSAGE = new InjectionToken<string>('MESSAGE');

export const LANG_SET = {
  [LANG_KO_NAME]: LANG_KO_MSGS
};
export const MESSAGE_PROVIDER = [
    {provide: MESSAGE, useValue: LANG_SET }
];

