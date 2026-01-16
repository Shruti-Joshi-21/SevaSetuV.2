import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from "./Layout";
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import TeamLeadDashboard from './pages/TeamLeadDashboard';
import Analytics from './pages/Analytics';
import AttendanceManagement from './pages/AttendanceManagement';
import AttendanceReview from './pages/AttendanceReview';
import FieldReports from './pages/FieldReports';
import LeaveManagement from './pages/LeaveManagement';
import LeaveRequest from './pages/LeaveRequest';
import MyAttendance from './pages/MyAttendance';
import MyTasks from './pages/MyTasks';
import MyTeam from './pages/MyTeam';
import ReportManagement from './pages/ReportManagement';
import ReportTemplates from './pages/ReportTemplates';
import SubmitReport from './pages/SubmitReport';
import TaskManagement from './pages/TaskManagement';
import TeamManagement from './pages/TeamManagement';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/VolunteerDashboard" element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerDashboard /></ProtectedRoute>} />
          <Route path="/StaffDashboard" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />
          <Route path="/TeamLeadDashboard" element={<ProtectedRoute allowedRoles={['team lead']}><TeamLeadDashboard /></ProtectedRoute>} />
          <Route path="/AdminDashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/Analytics" element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />
          <Route path="/AttendanceManagement" element={<ProtectedRoute allowedRoles={['admin']}><AttendanceManagement /></ProtectedRoute>} />
          <Route path="/AttendanceReview" element={<ProtectedRoute allowedRoles={['team lead']}><AttendanceReview /></ProtectedRoute>} />
          <Route path="/FieldReports" element={<ProtectedRoute allowedRoles={['team lead']}><FieldReports /></ProtectedRoute>} />
          <Route path="/LeaveManagement" element={<ProtectedRoute allowedRoles={['admin']}><LeaveManagement /></ProtectedRoute>} />
          <Route path="/LeaveRequest" element={<ProtectedRoute allowedRoles={['volunteer', 'staff', 'team lead', 'admin']}><LeaveRequest /></ProtectedRoute>} />
          <Route path="/MyAttendance" element={<ProtectedRoute allowedRoles={['staff']}><MyAttendance /></ProtectedRoute>} />
          <Route path="/MyTasks" element={<ProtectedRoute allowedRoles={['volunteer', 'staff', 'team lead']}><MyTasks /></ProtectedRoute>} />
          <Route path="/MyTeam" element={<ProtectedRoute allowedRoles={['team lead']}><MyTeam /></ProtectedRoute>} />
          <Route path="/ReportManagement" element={<ProtectedRoute allowedRoles={['admin']}><ReportManagement /></ProtectedRoute>} />
          <Route path="/ReportTemplates" element={<ProtectedRoute allowedRoles={['admin']}><ReportTemplates /></ProtectedRoute>} />
          <Route path="/SubmitReport" element={<ProtectedRoute allowedRoles={['volunteer']}><SubmitReport /></ProtectedRoute>} />
          <Route path="/TaskManagement" element={<ProtectedRoute allowedRoles={['team lead']}><TaskManagement /></ProtectedRoute>} />
          <Route path="/TeamManagement" element={<ProtectedRoute allowedRoles={['admin']}><TeamManagement /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
