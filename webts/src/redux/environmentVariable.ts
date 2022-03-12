import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedRoom: "",
};

export const environmentVariableSlice = createSlice({
  name: 'environmentVariable',
  initialState,
  reducers: {
    // increment: (state) => {
    //   state.msgHistory += 1;
    // },
    // decrement: (state) => {
    //   state.msgHistory -= 1;
    // },
    setSelectedRoom: (state, action) => {
      console.log('state', state);
      console.log('action', action);
      const {payload} = action;
      state.selectedRoom = payload;
      // state.msgHistory.push(action.payload);
    },
  },
});

export const { setSelectedRoom } = environmentVariableSlice.actions;
export default environmentVariableSlice.reducer;
