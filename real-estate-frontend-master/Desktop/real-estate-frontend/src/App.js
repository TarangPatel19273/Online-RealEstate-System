import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";
import VerifyOtp from "./components/VerifyOtp";
import ProtectedRoute from "./components/ProtectedRoute";
import SellProperty from "./pages/SellProperty";
import MyProperties from "./components/MyProperties";
import PropertyDetails from "./components/PropertyDetails";
import ErrorBoundary from "./components/ErrorBoundary";
import ForgotPassword from "./components/ForgotPassword";
import VerifyPasswordOtp from "./components/VerifyPasswordOtp";
import ResetPassword from "./components/ResetPassword";
import BudgetCalculator from "./components/BudgetCalculator";
import DocumentsInfo from "./components/DocumentsInfo";
import Profile from "./components/Profile";
import Wishlist from "./components/Wishlist";
import LoanApplication from "./pages/LoanApplication";
import MyLoans from "./pages/MyLoans";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminProperties from "./components/admin/AdminProperties";
import AdminUsers from "./components/admin/AdminUsers";
import AdminVisits from "./components/admin/AdminVisits";
import AdminLoans from "./components/admin/AdminLoans";
import Compare from "./components/Compare";
import MyVisits from "./components/MyVisits";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-password-otp" element={<VerifyPasswordOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/budget-calculator" element={<BudgetCalculator />} />
          <Route path="/documents-info" element={<DocumentsInfo />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sell-property"
            element={
              <ProtectedRoute>
                <SellProperty />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-properties"
            element={
              <ProtectedRoute>
                <MyProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/property/:id"
            element={
              <ProtectedRoute>
                <PropertyDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loan-application"
            element={
              <ProtectedRoute>
                <LoanApplication />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-loans"
            element={
              <ProtectedRoute>
                <MyLoans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <Compare />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-visits"
            element={
              <ProtectedRoute>
                <MyVisits />
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="visits" element={<AdminVisits />} />
            <Route path="loans" element={<AdminLoans />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
