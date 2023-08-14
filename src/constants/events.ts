export enum PUB_EVENTS {
    ADD_BET = 'addBet',
    GAME_BALANCE_CHANGE = 'gameBalanceChange',
    CHANGE_STATE = 'changeState'
}

export enum SUB_EVENTS {
    ADD_BET = 'addBet',
}

export enum MAIN_EVENTS {
    ROULETE_TIMER_START = 'RouleteTimerStart',
    RESET_GAME = 'RouleteReset',
    ROULETE_WAITING = 'RouleteWaiting',
    ROULETE_WHEEL_START = 'RouleteWheelStart',
    ROULETE_FINISH = 'RouleteFinish',
    ADD_BET = 'addBet',
    CHANGE_STATE = 'changeState',
}

export enum EXCEPTION_EVENTS {
    EXCEPTION = 'exception',
}