import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import HomeCustomer from "./pages/HomeCustomer.jsx";
import AdminHome from "./pages/AdminHome.jsx";
import Dashboard from "./pages/AdminScreens/DashBoardScreen.jsx";
import CarsManager from "./pages/AdminScreens/CarsManager.jsx";
import AddCar from "./pages/AdminScreens/AddCars.jsx";
import UsersManager from "./pages/AdminScreens/UsersManager.jsx";
import BookingManagement from "./pages/AdminScreens/BookingManager.jsx";
import ContractManager from "./pages/AdminScreens/ContractManager.jsx";
import VoucherManager from "./pages/AdminScreens/VoucherManager.jsx";
import AdminSettings from "./pages/AdminScreens/Setting.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import CarDetail from "./pages/CarDetail.jsx";
import FavoriteCars from "./pages/FavoriteCars.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Rewards from "./pages/Rewards.jsx";
import CommunityFeed from "./pages/CommunityFeed.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import AdminCommunityFeed from "./pages/AdminScreens/AdminCommunityFeed.jsx";
import BookingDetail from "./pages/BookingDetail.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import ProfileUser from "./pages/ProfileUser.jsx";
function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "15px",
            background: "#111827",
            color: "#fff",
            fontWeight: 600,
            padding: "14px 18px",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomeCustomer />} />
        <Route path="/home" element={<HomeCustomer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/cars/:id" element={<CarDetail />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/community" element={<CommunityFeed />} />
        <Route path="/community/create" element={<CreatePost />} />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoriteCars />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileUser />
            </ProtectedRoute>
          }
        />

        <Route path="/admin" element={<AdminHome />}>
          <Route index element={<Dashboard />} />
          <Route path="cars" element={<CarsManager />} />
          <Route path="add-car" element={<AddCar />} />
          <Route path="edit-car/:id" element={<AddCar />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="orders" element={<BookingManagement />} />
          <Route path="contracts" element={<ContractManager />} />
          <Route path="vouchers" element={<VoucherManager />} />
          <Route path="community" element={<AdminCommunityFeed />} />
          <Route path="/admin/community/create" element={<CreatePost />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
