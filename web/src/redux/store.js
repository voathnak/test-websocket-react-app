import { configureStore } from "@reduxjs/toolkit";

import messageHistory from "./messageHistory";
import user from "./user";

export default configureStore({
  reducer: {
    messageHistory,
    user,
  },
});
