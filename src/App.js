import AccountList from './features/goalSavings/components/accounts/AccountList.js';

export default function App() {
  return (
    <div className="app-container">
      <h1 style={{textAlign: 'center', paddingTop: '20px'}}>Goal Savings</h1>
      <AccountList/>
      
    </div>
  );
}
