import {AsyncThunk, createAsyncThunk, createSlice} from "@reduxjs/toolkit";


interface User {
    isLoggedIn?: boolean,
    username: string,
    token: string,
    photoURL?: string,
    id: string,
}
interface UsersState {
  user: User,
  test: string,
  status: 'idle' | 'pending' | 'succeeded' | 'failed'
}

interface LoginRequest {
  username: string,
  password: string
}

interface LoginReturned {
  status: number,
  data: UsersState
}

const initialState = {
  user: {
    isLoggedIn: false,
    username: "",
    token: "",
    photoURL: "",
    id: "",
  },
  test: "xxxx",
  status: 'idle',
} as UsersState;

export const loginUser = createAsyncThunk(
  "users/login",
  async ({ username, password }: LoginRequest) => {
    // console.log({ obj });
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    console.info({ username, password });
    const body = JSON.stringify({username, password});

    const requestOptions = {method: "POST", headers, body, redirect: "follow"};

    const response = await fetch(
      "https://0y8x4tfft1.execute-api.ap-southeast-1.amazonaws.com/dev/users/login",
      requestOptions as RequestInit
    );
    return ({ status: response.status, data: await response.json() }) as LoginReturned;
  }
);



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
  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state, action) => {
      state.status = "pending";
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      // [loginUser.fulfilled]: (state, { payload }) => {
      const {
        payload: {status, data: payload},
      } = action;

      state.status = "succeeded";
      // for now
      // console.warn("Unresolved Point");
      console.log({payload});
      // console.warn("Unresolved Point");

      state.user = payload as unknown as User;
      // state.user.token = payload.token;
      console.info({payload});
      console.info({state});
      console.info({status});
      if (status === 200) {
        state.user.isLoggedIn = true;
      }
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = "failed";
    });
  }
});

// export const { setUser } = userSlice.actions;
export default userSlice.reducer;
