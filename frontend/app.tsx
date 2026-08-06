import { QueryProvider } from './lib/providers/QueryProvider';
import { LoginPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <QueryProvider>
      <div>
        <h1>FinTrack App</h1>
        {/* Add your routing logic here */}
      </div>
    </QueryProvider>
  );
}

export default App;