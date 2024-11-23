import ProtectedRoute from '../../components/ProtectedRoute';
import StoreDashboard from '../../components/StoreDashboard';

export default function StorePage() {
  return (
    <ProtectedRoute allowedRoles={['store']}>
      <StoreDashboard />
    </ProtectedRoute>
  );
}
