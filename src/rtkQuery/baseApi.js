import {createApi , fetchBaseQuery} from '@reduxjs/toolkit/query/react';

const BEARER_TOKEN = process.env.REACT_APP_BEARER_TOKEN; // Fetch the bearer token securely from environment variables

const baseQuery = fetchBaseQuery({
	// baseUrl: "https://api-sandbox.starlingbank.com/api/v2",
    prepareHeaders: (headers) => {
        if (BEARER_TOKEN) {
          headers.set('Authorization', `Bearer ${BEARER_TOKEN}`);
        }
        headers.set('Content-Type', 'application/json');
        headers.set('Accept', 'application/json');
        return headers;
      },
});

export const baseApi = createApi({
	reducerPath: 'baseApi',
	baseQuery: baseQuery,
	tagTypes: ['transaction_list', 'Account_List'],
	endpoints: () => ({}),
});
