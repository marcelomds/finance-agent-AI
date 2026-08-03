import { ExpensesDashboard } from './features/expenses/components/ExpensesDashboard';

// TODO: replace with the real logged-in user once auth exists
const TEST_USER_ID = 'cmsdi55s400001dp9kvzuuh89';

function App() {
  return <ExpensesDashboard userId={TEST_USER_ID} />;
}

export default App;
