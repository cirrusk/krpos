export class NiceConstants {
    public static FS = '\x1C';
    public static DELIMITER: string = NiceConstants.FS;

    public static SIGN_AMOUNT = 50000;

    public static CODE = {
        'CARD_APPROVAL': 'D1',
        'CARD_CANCCEL': 'D2',

        'CASHICCARD_APPROVAL': 'A1',
        'CASHICCARD_CANCEL': 'A2'
    };

    public static REQEUST_SUCCESSFUL = '1';

    public static ERROR_CODE = {
        'NORMAL': '1',
        'LINE_ERROR': '-0001',
        'AGENT_ERROR': '-0002',
        'POWERDOWN': '-0003',
        'HALT': '-0004',
        'INVALID_REQ': '-0014',
        'APPROVAL_ARG_ERROR': '-0020',
        'WEBSOCKET_ERROR': '-0021'
    };

    public static ERROR_MESSAGE = {
        // NICE 정보통신 제공 (Agent 리턴)
        // 정상
        ['1']: 'NORMAL',

        // 포트 오픈 실패
        ['-0001']: 'POS 와 NICE 단말기 단선. 선 연결을 점검해주세요.',

        // 포트 이미 열려 있음
        ['-0002']: 'NICE 단말기 연결 실패. NICE 단말기 연결선과 Agent 프로그램을 점검해주세요.',

        // ACK 없음 (단말기 연결 실패)
        ['-0003']: '카드가 동글에 뽑혀 있는지, NICE 단말기 전원이 켜져 있는지 확인 후 재시도 해주세요.',

        // LRC 오류(??) 또는 종료버튼(??)
        ['-0004']: '요청을 NICE 단말기에서 종료했습니다. 네트워크 이상을 확인해주세요.',

        // 요청 전문 이상
        ['-0014']: 'CAT TYPE 전문이 잘못되었습니다.',


        // 커스텀 에러 메시지
        // 금액 또는 할부 이상
        ['-0020']: '금액은 0 보다 큰 정수이어야 합니다. 할부 개월 수는 0 보다 커야 합니다.',

        // WebSocket 재연결
        ['-0021']: '단말기 재연결 중. 잠시 후 (30초) 다시 시도해주세요.',
    };
}
