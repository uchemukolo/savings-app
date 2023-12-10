import { configureStore } from '@reduxjs/toolkit';
import goalSavingReducer from './goalSavingSlice';
import { setupListeners } from '@reduxjs/toolkit/query/react';
import { goalSavingApi } from '../features/goalSavings/api/goalSavingApiSlice';

const store = configureStore({
    reducer: {
        account: goalSavingReducer,
        [goalSavingApi.reducerPath]: goalSavingApi.reducer,
    },
    // ? Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat([goalSavingApi.middleware]),

  })
  setupListeners(store.dispatch); // Add setupListeners to handle RTK-Query lifecycles

  export default store;
