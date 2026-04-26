import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/Register";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Dashboard from "./pages/Dashboard";
import MyRequests from "./pages/MyRequests";
import Alerts from "./pages/Alerts";
import EmiCalculator from "./pages/EmiCalculator";
import EmiCurrencyCalculator from "./pages/EmiCurrencyCalculator";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/emi-calculator" element={<EmiCalculator />} />
        <Route path="/emi-calculator-currency" element={<EmiCurrencyCalculator />} />
      </Route>
    </Routes>
  );
}

export default App;
