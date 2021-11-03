import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    isLoggedIn: false,
    displayName: "",
    token: "",
    photoURL: "",
  },
};

export const userSlice = createSlice({
  name: "loggedInUser",
  initialState,
  reducers: {
    // increment: (state) => {
    //   state.msgHistory += 1;
    // },
    // decrement: (state) => {
    //   state.msgHistory -= 1;
    // },
    setUser: (state, action) => {
      Object.assign(state.user, action.payload);
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
