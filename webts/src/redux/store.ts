import { configureStore } from '@reduxjs/toolkit';

import messageHistory from './messageHistory';
import userReducer from './usersSlice';
import environmentVariable from "./environmentVariable";

const store = configureStore({
  reducer: {
    messageHistory,
    environmentVariable,
    user: userReducer,
  },
});

export default store;
