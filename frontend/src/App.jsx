import { Navigate, Route, Routes } from "react-router-dom";
<<<<<<< HEAD
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PropertyDetails from "./pages/PropertyDetails";
=======
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/login";
import Register from "./pages/Register";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Dashboard from "./pages/Dashboard";
import MyRequests from "./pages/MyRequests";
>>>>>>> origin/develop

function App() {
  return (
    <Routes>
<<<<<<< HEAD
      <Route path="/" element={<Home />} />
      <Route path="/property/:id" element={<PropertyDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
=======
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
>>>>>>> origin/develop
    </Routes>
  );
}

export default App;
