import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ReactModal from 'react-modal';
import { useGetAccountsTransactionsQuery } from '../../api/goalSavingApiSlice.js';
import { addDecimal } from '../../utils/index.js';
import CreateSavingGoalForm from '../createGoalSavingForm/CreateSavingGoalForm.js';
import {
  useCreateSavingGoalMutation,
  useGetSavingGoalsQuery,
  useTransferToSavingGoalRoundMutation,
} from '../../api/goalSavingApiSlice.js';
import { formatDate } from '../../utils/index.js';
import './GoalSavingContainer.css';


export const GoalSavingContainer = ({ accountData }) => {
  const [isOpen, setIsOpen] = useState(false); // Set initial state to false
  const [success, setSuccess] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState({});
  const accountUid = accountData?.accountUid;
  const selectedAccount = useSelector(state => state.account.selectedAccount);
  const { data, isLoading, isError } = useGetAccountsTransactionsQuery(selectedAccount);
  const { isSuccess } = useCreateSavingGoalMutation(accountUid);
  const { data: savingGoalsData } = useGetSavingGoalsQuery(selectedAccount);
  const [transferToSavingGoalRound] = useTransferToSavingGoalRoundMutation();

  const handleRoundUpWeeklyAmount = (savingsGoalUid) => {
    transferToSavingGoalRound({ accountUid, savingsGoalUid, currency: selectedAccount.currency, minorUnits: roundUpAmount });
  };

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };
  // Check if data is an array before using map
  const formattedData = Array.isArray(data?.results)
    ? data?.results?.map((transaction) => ({
      amount: transaction.amount.minorUnits,
      transactionTime: transaction.transactionTime,
      reference: transaction.reference
    }))
    : [];

 // Filter transactions within the last seven days
  const lastSevenDaysTransactions = data?.results?.filter(transaction => {
  const transactionDate = new Date(transaction.updatedAt);
  const lastSevenDays = new Date();
  lastSevenDays.setDate(lastSevenDays.getDate() - 7);
  return transactionDate > lastSevenDays;
});

// Function to round up amounts
const roundUpAmount = () => {
  let currentData = [];

  // If there are no transactions within the last seven days, return 0
  if (lastSevenDaysTransactions?.length === 0) {
    return 0;
  }

  // Iterate through lastSevenDaysTransactions
  for (let transaction of lastSevenDaysTransactions) {
    if (transaction.spendingCategory === 'SAVING') {
      break;
    }
    // Push transaction to currentData array
    currentData.push(transaction);
  }

  if (currentData.length > 0) {
    return currentData.reduce((total, transaction) => {
      const transactionAmount = transaction.amount.minorUnits;
      
      // Round up transactionAmount to nearest pound
      const roundedAmount = Math.ceil(transactionAmount / 100) * 100;

      // Calculate the difference to round up and accumulate in total
      return total + roundedAmount - transactionAmount;
    }, 0);
  }
  
  // Return 0 if there are no transactions in currentData
  return 0;
};


  useEffect(() => {
    if (isSuccess) {
      // If isSuccess becomes true, close the modal after a delay
      const timeout = setTimeout(() => {
        closeDialog();
        setSuccess(false);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [isSuccess]);

  const handleFormSubmissionSuccess = () => {
    setSuccess(true);
  };


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || data?.results === undefined || data?.results?.length === 0) {
    return <div><p>Error fetching data</p>
    </div>;
  }

  return (
    <div className="selected-account-details">
      <h2>Account - {selectedAccount?.accountType} ({selectedAccount?.currency})</h2>
      <div className="round-up-amount-display">
        <p>
          Total Round-up Amount for Last 7 Days: <strong>{addDecimal(roundUpAmount())}</strong>
        </p>
        <div className="button-container">
          <button className="buttons" onClick={openDialog}>Add Savings goal</button>
        </div>
      </div>

      <h3>My Savings Goals</h3>
      <p className="goal-info"><i>(Click on a savings goal to transfer available round up amount)</i></p>
      <div>
        {isSuccess && <p className='success'>Savings goal created successfully</p>}
      </div>
      <div className="goals-details-container">
        {savingGoalsData?.savingsGoalList?.map((savingGoal) => {
          return (
            <div className="goals-details" key={savingGoal.savingsGoalUid} onClick={() => setSelectedGoal(savingGoal)}>
              <h3>{savingGoal.name}</h3>
              <p>Target: {savingGoal.target?.minorUnits}</p>
              <p>Current Balance: {addDecimal(savingGoal.totalSaved?.minorUnits)}</p>
            </div>
          )
        })}
      </div>
      <div>
        <button
          disabled={!selectedGoal?.name}
          style={{ backgroundColor: selectedGoal?.name ? '#4CAF50' : '#ccc' }}
          className='buttons'
          onClick={() => !selectedGoal?.savingsGoalUid ? null : handleRoundUpWeeklyAmount(selectedGoal.savingsGoalUid)}>
          Transfer to {selectedGoal?.name} Savings
        </button>
      </div>
      {/* Table for transaction history */}
      <h3>Transaction History</h3>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Transaction Time</th>
            <th>Reference</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {formattedData?.map((transaction) => (
            <tr key={transaction.accountUid}>
              <td>{formatDate(transaction.transactionTime)}</td>
              <td>{transaction.reference}</td>
              <td>{addDecimal(transaction.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Create saving goal modal */}
      <div>
        <ReactModal
          isOpen={isOpen}
          onRequestClose={closeDialog}
          contentLabel="Savings Goal Modal"
          size="sm"
          className='Modal'
          overlayClassName="Overlay"
        >
          <div className='close-wrapper'>
            <button className='close-btn' onClick={closeDialog}>X</button>
            </div>
            <h2>Add Savings Goal</h2>
            <CreateSavingGoalForm
            accountUid={accountUid}
            success={success}
            closeModal={closeDialog}
            handleFormSubmissionSuccess={handleFormSubmissionSuccess}
          />
        </ReactModal>
      </div>
    </div>

  );
}

export default GoalSavingContainer;