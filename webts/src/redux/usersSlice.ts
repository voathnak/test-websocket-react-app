import {AsyncThunk, createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {Contact, User} from "../type";
import {ContactReturnMapper} from "../utils/mapper";
const { REACT_APP_AUTH_URL: authServiceUrl = "" } = process.env;

interface UsersState {
  user: User,
  test: string,
  status: 'idle' | 'pending' | 'succeeded' | 'failed'
  contacts: Contact[]
}

interface LoginRequest {
  username: string,
  password: string
}

interface LoginReturned {
  status: number,
  data: UsersState
}

interface ContactReturned {
  status: number,
  data: {
    data: [Contact]
  }
}

const initialState = {
  user: {
    isLoggedIn: false,
    username: "",
    token: "",
    photoURL: "",
    id: "",
  },
  contacts: [],
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

    const response = await fetch(`${authServiceUrl}/users/login`,
      requestOptions as RequestInit
    );
    return ({ status: response.status, data: await response.json() }) as LoginReturned;
  }
);

export const userContact = createAsyncThunk(
  "list/users",
  async () => {
    // console.log({ obj });
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const requestOptions = {method: "GET", headers, redirect: "follow"};

    const response = await fetch(`${authServiceUrl}/users`,
      requestOptions as RequestInit
    );
    return ({ status: response.status, data: await response.json() }) as ContactReturned;
  }
);



export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state, action) => {
      state.status = "pending";
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      const {
        payload: {status, data: payload},
      } = action;

      state.status = "succeeded";
      console.log({payload});

      state.user = payload as unknown as User;
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

    builder.addCase(userContact.pending, (state) => {
      state.status = "pending";
    });

    builder.addCase(userContact.fulfilled, (state, action) => {
      state.status = "succeeded";
      const {
        payload: {status, data: {data: contacts}},
      } = action;

      console.info({action});
      console.info({contacts});
      console.info({state});
      console.info({status});
      state.contacts = ContactReturnMapper(contacts);
    });

    builder.addCase(userContact.rejected, (state) => {
      state.status = "failed";
    });
  }
});

// export const { setUser } = userSlice.actions;
export default userSlice.reducer;
