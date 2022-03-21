import { createSlice } from '@reduxjs/toolkit';
import {DisplayMessageHistory} from "../type";

const initialState = {
  messageHistory: {} as DisplayMessageHistory,
};

export const messageHistorySlice = createSlice({
  name: 'messageHistory',
  initialState,
  reducers: {
    // increment: (state) => {
    //   state.msgHistory += 1;
    // },
    // decrement: (state) => {
    //   state.msgHistory -= 1;
    // },
    addMessageHistory: (state, action) => {
      console.warn('Unresolved Point');
      // state.msgHistory.push(action.payload);
    },
    setMessageHistory: (state, action) => {
      console.group('reducer/setMessageHistory');
      console.log({action});
      const {payload: {room, messages}} = action;
      console.log({room});
      console.log({messages});
      state.messageHistory[room] = messages;
      console.groupEnd();
    },
  },
});

export const { addMessageHistory, setMessageHistory } = messageHistorySlice.actions;
export default messageHistorySlice.reducer;
