import { Routes, Route, Navigate } from 'react-router-dom';

import Register           from './komponente/Register';
import Login              from './komponente/Login';
import Home               from './komponente/Home';

import ProtectedRoute     from './komponente/ProtectedRoute';
import ProtectedLayout    from './komponente/ProtectedLayout';

import PerformanceReviewsEmployee    from './komponente/employee/PerformanceReviewsEmployee';
import LeaveRequestsEmployee from './komponente/employee/LeaveRequestsEmployee';
import PerformanceReviewsHrWorker    from './komponente/hr_worker/PerformanceReviewsHrWorker';
import LeaveRequestsHrWorker from './komponente/hr_worker/LeaveRequestsHrWorker';

import WorldMap from './komponente/administrator/WorldMap';

import AdminDashboard        from './komponente/administrator/AdminDashboard';
import ViewUsers from './komponente/administrator/ViewUsers';

function App() {

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/"         element={<Login />}    />

      {/* All protected pages share the sidebar/layout */}
      <Route
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home"                   element={<Home />} />
        <Route
          path="/leave-requests"
          element={<LeaveRequestsEmployee />}
        />
        <Route
        path="/leave-requests-hr"
        element={<LeaveRequestsHrWorker />}
        />
         <Route
          path="/performance-reviews"
          element={<PerformanceReviewsEmployee />}
        />
        <Route
          path="/performance-reviews-hr"
          element={<PerformanceReviewsHrWorker />}
        />

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />
        <Route
          path="/view-users"
          element={<ViewUsers />}
        />
        <Route
          path="/world-map"
          element={<WorldMap />}
        />
        {/* Redirect any unmatched protected path back to /home */}
        <Route path="*"                        element={<Navigate to="/home" replace />} />
      </Route>

      {/* Fallback: if no route matched above, send to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
