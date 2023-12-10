import { createSlice } from "@reduxjs/toolkit"

// Initial state for the goalSaving slice
const initialState = {
    accounts: [],
    selectedAccount: {
        accountUid: '',
        accountType: '',
        defaultCategory: '',
        currency: '',
        createdAt: '',
        name: ''
    },
}

// Creating a slice using Redux Toolkit's createSlice method
const goalSavingSlice = createSlice({
    name: 'goalSaving',
    initialState,
    reducers: {
        // Reducer function to save accounts into state
        saveAccounts: (state, action) => {
            state.accounts = action.payload.accounts
        },
        // Reducer function to save the selected account details into state
        saveSelectedAccount: (state, action) => {
            state.selectedAccount = action.payload.account
        },
    },
})

export const { saveAccounts, saveSelectedAccount } = goalSavingSlice.actions

export default goalSavingSlice.reducer;
