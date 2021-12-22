import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    isLoggedIn: false,
    username: "",
    token: "",
    photoURL: "",
    id: "",
  },
  test: "xxxx",
  status: null,
};

export const loginUser = createAsyncThunk("post/login", async () => {
  // console.log({ obj });
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    username: "vlim",
    password: "P@$$uu0rD",
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  return fetch(
    "https://0y8x4tfft1.execute-api.ap-southeast-1.amazonaws.com/dev/users/login",
    requestOptions
  ).then(async (res) => ({ status: res.status, data: await res.json() }));
});

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  // reducers: {
  //   // increment: (state) => {
  //   //   state.msgHistory += 1;
  //   // },
  //   // decrement: (state) => {
  //   //   state.msgHistory -= 1;
  //   // },
  //   setUser: (state, action) => {
  //     Object.assign(state.user, action.payload);
  //   },

  // },
  extraReducers: {
    [loginUser.pending]: (state, action) => {
      state.status = "loading";
    },
    [loginUser.fulfilled]: (state, response) => {
      // [loginUser.fulfilled]: (state, { payload }) => {
      const {
        payload: { status, data: payload },
      } = response;
      state.status = "fulfilled";
      state.user = payload;
      state.user.token = payload.token;
      console.info({ payload });
      console.info({ state });
      console.info({ status });
      if (status === 200) {
        state.user.isLoggedIn = true;
      }
    },
    [loginUser.rejected]: (state, action) => {
      state.status = "rejected";
    },
  },
});

// export const { setUser } = userSlice.actions;
export default userSlice.reducer;
