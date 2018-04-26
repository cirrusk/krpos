import { InjectionToken } from '@angular/core';
import { LANG_KO_NAME, LANG_KO_MSGS } from './msg-ko';
import { LANG_EN_NAME, LANG_EN_MSGS } from './msg-en';
export const MESSAGE = new InjectionToken<string>('MESSAGE');

export const LANG_SET = {
  [LANG_KO_NAME]: LANG_KO_MSGS,
  [LANG_EN_NAME]: LANG_EN_MSGS
};

export const MESSAGE_PROVIDER = [
    {provide: MESSAGE, useValue: LANG_SET }
];
