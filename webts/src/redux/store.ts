import { configureStore } from '@reduxjs/toolkit';

import messageHistory from './messageHistory';
import userReducer from './usersSlice';

const store = configureStore({
  reducer: {
    messageHistory,
    user: userReducer,
  },
});

export default store;
