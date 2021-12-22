import { configureStore } from "@reduxjs/toolkit";

import messageHistory from "./messageHistory";
import userReducer from "./usersSlice";

export default configureStore({
  reducer: {
    messageHistory,
    user: userReducer,
  },
});
