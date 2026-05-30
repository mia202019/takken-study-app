import Home from './pages/Home';
import { CloudSyncProvider } from './lib/CloudSyncContext';

export default function App() {
  return (
    <CloudSyncProvider>
      <Home />
    </CloudSyncProvider>
  );
}
