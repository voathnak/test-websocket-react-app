import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  msgHistory: [],
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
    addMsgHistory: (state, action) => {
      console.warn('Unresolved Point');
      // state.msgHistory.push(action.payload);
    },
  },
});

export const { addMsgHistory } = messageHistorySlice.actions;
export default messageHistorySlice.reducer;
