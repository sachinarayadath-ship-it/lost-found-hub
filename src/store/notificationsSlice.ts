import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

import { notificationsApi } from "@/services/api";
import type { Notification } from "@/types";

interface State {
  items: Notification[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: State = { items: [], status: "idle" };

export const fetchNotifications = createAsyncThunk("notifications/fetch", async () =>
  notificationsApi.list(),
);

const slice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    markRead(state, action: PayloadAction<string>) {
      const found = state.items.find((n) => n._id === action.payload);
      if (found) found.read = true;
      void notificationsApi.markRead(action.payload);
    },
    markAllRead(state) {
      state.items.forEach((n) => (n.read = true));
      void notificationsApi.markAllRead();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { markRead, markAllRead } = slice.actions;
export default slice.reducer;
