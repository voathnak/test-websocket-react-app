import { configureStore } from "@reduxjs/toolkit";
import messageHistory from "./messageHistory";

export default configureStore({
  reducer: {
    messageHistory,
  },
});
