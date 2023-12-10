import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { saveAccounts, saveSelectedAccount } from '../../../../store/goalSavingSlice.js';
import { useGetAccountsQuery } from '../../api/goalSavingApiSlice.js';
import GoalSavingContainer from '../goalSavingContainer/GoalSavingContainer.js';

import './accountList.css';

const AccountList = () => {
  const [activeTab, setActiveTab] = useState(null);
  const dispatch = useDispatch();

  // Fetching account data using a custom query hook
  const { data = [] } = useGetAccountsQuery();
  const { accounts: accountsData } = data;

  // Function to handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Save fetched accounts data to Redux store when data changes
  useEffect(() => {
    if (accountsData) {
      dispatch(saveAccounts({ accountsData }));
    }
  }, [accountsData, dispatch]);

  // Load transactions of a specific account and set it as active
  const loadTransactions = (account) => {
    dispatch(saveSelectedAccount({ account }));
    setActiveTab(account?.accountUid);
  };

  return (
    <>
      {/* Display a list of accounts */}
      <div className="account-list">
        {accountsData?.map((accountData) => (
          <div key={accountData.accountUid} className="account-item" onClick={() => loadTransactions(accountData)}>
            <p>
              Account: {accountData.accountType}{' '}
              <span className='currency'>({accountData.currency})</span>
            </p>    
          </div>
        ))}
      </div>

      {/* Information for selecting an account */}
      <p className="acct-info"><i>Select an account to view more details</i></p>

      {/* Display account details */}
      <div className="account-detail-list">
        {accountsData?.map((accountData) => (
          <div
            key={accountData.accountUid}
            className={`${activeTab === accountData.accountUid ? '' : 'none'}`}
            onClick={() => handleTabChange(accountData.accountUid)}
          >
            {activeTab === accountData?.accountUid && (
              // Render GoalSavingContainer when an account is active
              <GoalSavingContainer accountData={accountData} />
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default AccountList;
