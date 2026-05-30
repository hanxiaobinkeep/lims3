import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InspectionRequest from './pages/InspectionRequest';
import Sample from './pages/Sample';
import InspectionTask from './pages/InspectionTask';
import InspectionResult from './pages/InspectionResult';
import Report from './pages/Report';
import Material from './pages/Material';
import Instrument from './pages/Instrument';
import Method from './pages/Method';
import User from './pages/User';
import Stability from './pages/Stability';
import Environment from './pages/Environment';
import Deviation from './pages/Deviation';
import SystemLog from './pages/SystemLog';
import DataReview from './pages/DataReview';
import DataManagement from './pages/DataManagement';
import Notification from './pages/Notification'
import Role from './pages/Role'
import Backup from './pages/Backup'
import Supplier from './pages/Supplier';
import ReferenceMaterial from './pages/ReferenceMaterial';
import Sampling from './pages/Sampling';
import ElectronicSignature from './pages/ElectronicSignature';
import QualityControl from './pages/QualityControl';
import Workflow from './pages/Workflow';
import Personnel from './pages/Personnel';
import ReagentConsumable from './pages/ReagentConsumable';
import DocumentManagement from './pages/DocumentManagement';
import ProficiencyTesting from './pages/ProficiencyTesting';
import IntermediateCheck from './pages/IntermediateCheck';
import StatisticsReports from './pages/StatisticsReports';
import ValidationManagement from './pages/ValidationManagement';
import StorageLocation from './pages/StorageLocation';
import CultureMedia from './pages/CultureMedia';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="samples/request" element={<InspectionRequest />} />
          <Route path="samples/receive" element={<Sample />} />
          <Route path="samples/sampling" element={<Sampling />} />
          <Route path="inspection/tasks" element={<InspectionTask />} />
          <Route path="inspection/entry" element={<InspectionResult />} />
          <Route path="inspection/reports" element={<Report />} />
          <Route path="resources/materials" element={<Material />} />
          <Route path="resources/instruments" element={<Instrument />} />
          <Route path="resources/methods" element={<Method />} />
          <Route path="resources/suppliers" element={<Supplier />} />
          <Route path="resources/reference-materials" element={<ReferenceMaterial />} />
          <Route path="resources/reagents" element={<ReagentConsumable />} />
          <Route path="system/users" element={<User />} />
          <Route path="system/roles" element={<Role />} />
          <Route path="system/logs" element={<SystemLog />} />
          <Route path="system/data" element={<DataManagement />} />
          <Route path="system/backup" element={<Backup />} />
          <Route path="system/signature" element={<ElectronicSignature />} />
          <Route path="system/workflow" element={<Workflow />} />
          <Route path="system/personnel" element={<Personnel />} />
          <Route path="quality/stability" element={<Stability />} />
          <Route path="quality/environment" element={<Environment />} />
          <Route path="quality/deviation" element={<Deviation />} />
          <Route path="quality/control" element={<QualityControl />} />
          <Route path="inspection/review" element={<DataReview />} />
          <Route path="documents" element={<DocumentManagement />} />
          <Route path="quality-assurance/proficiency-testing" element={<ProficiencyTesting />} />
          <Route path="quality-assurance/intermediate-check" element={<IntermediateCheck />} />
          <Route path="quality-assurance/validation" element={<ValidationManagement />} />
          <Route path="resources/storage-locations" element={<StorageLocation />} />
          <Route path="resources/culture-media" element={<CultureMedia />} />
          <Route path="statistics" element={<StatisticsReports />} />
          <Route path="notifications" element={<Notification />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
