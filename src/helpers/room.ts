import { MAIN_EVENTS } from '../constants';

export const createRoomName = (lotId: string, eventName: MAIN_EVENTS) =>
    `${lotId}:${eventName}`;
