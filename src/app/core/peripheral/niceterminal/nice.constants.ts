export class NiceConstants {
    public static FS: string = '\x1C';
    public static DELIMITER: string = NiceConstants.FS;

    public static SIGN_AMOUNT: number = 50000;

    public static CODE = {
        'CARD_APPROVAL': 'D1',
        'CARD_CANCCEL': 'D2',

        'CASHICCARD_APPROVAL': 'A1',
        'CASHICCARD_CANCEL': 'A2'
    };

    public static REQEUST_SUCCESSFUL = '1';

    public static ERROR_MESSAGE = {
        // 정상
        ["1"]: 'NORMAL',
        // 포트 오픈 실패
        ['-1']: 'PORT_OPEN_FAILED',
        // 포트 이미 열려 있음
        ['-2']: 'PORT_ALREADY_OPEN',
        // ACK 없음 (단말기 연결 실패)
        ['-3']: 'CONNECTION_FAILED',
        // LRC 오류(??) 또는 종료버튼(??)
        ['-4']: 'TERMINATED',
        // 요청 전문 이상
        ['-14']: 'REQUEST_FORMAT_ERROR'
    }
}