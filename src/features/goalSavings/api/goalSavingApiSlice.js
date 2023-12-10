import { baseApi } from '../../../rtkQuery/baseApi.js';

// Creating the goalSavingApi using baseApi's enhanceEndpoints and injectEndpoints functions
export const goalSavingApi = baseApi.enhanceEndpoints({}).injectEndpoints({
  // Define additional tags to identify types of data fetched
  addTagTypes: [
    'transactions_list',
    'goals_list',
  ],
  // Define endpoints for different API calls using builder methods
  endpoints: (builder) => ({
    // Fetch accounts information
    getAccounts: builder.query({
      query: () => {
        return {
          url: '/accounts',
          method: 'GET',
        };
      },
    }),
    // Fetch transactions for specific accounts
    getAccountsTransactions: builder.query({
      query: (account) => {
        return {
          url: `/feed/account/${account.accountUid}/category/${account.defaultCategory}?changesSince=${account.createdAt}`,
          method: 'GET',
        };
      },
      transformResponse: (response) => {
        // Transform the response structure to maintain consistency
        return Array.isArray(response.feedItems)
          ? { results: response.feedItems }
          : response;
      },
      providesTags: ['transactions_list'], // Provide tags for caching purposes
    }),
    // Fetch saving goals for specific accounts
    getSavingGoals: builder.query({
      query: (account) => {
        return {
          url: `/account/${account.accountUid}/savings-goals`,
          method: 'GET',
        };
      },
      providesTags: ['goals_list'], // Provide tags for caching purposes
    }),
    // Create a new saving goal for a specific account
    createSavingGoal: builder.mutation({
      query: ({ accountUid, name, currency, target, base64EncodedPhoto }) => {
        return {
          url: `/account/${accountUid}/savings-goals`,
          method: 'PUT',
          body: { name, currency, target, base64EncodedPhoto },
        };
      },
      invalidatesTags: ['transactions_list'], // Invalidate specific tags after mutation
    }),
    // Perform a transfer to a specific saving goal
    transferToSavingGoalRound: builder.mutation({
      query: ({ accountUid, currency, savingsGoalUid, minorUnits, topUp = false }) => {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];
        const recurrenceRule = { startDate: formattedDate, frequency: 'WEEKLY', interval: 1 };
        const amount = { currency, minorUnits };
        return {
          url: `/account/${accountUid}/savings-goals/${savingsGoalUid}/recurring-transfer`,
          method: 'PUT',
          body: { recurrenceRule, topUp, amount },
        };
      },
      invalidatesTags: ['transactions_list', 'goals_list'], // Invalidate specific tags after mutation
    }),
  }),
});

// Destructure the generated hooks from the goalSavingApi for use in components
export const {
  useGetAccountsQuery,
  useGetAccountsTransactionsQuery,
  useCreateSavingGoalMutation,
  useGetSavingGoalsQuery,
  useTransferToSavingGoalRoundMutation,
} = goalSavingApi;
