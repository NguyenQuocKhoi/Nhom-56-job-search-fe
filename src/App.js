import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import Signup from './pages/Signup/Signup';
import Profile from './pages/Profile/Profile';
import Companies from './pages/Companies/Companies';
import Jobs from './pages/Jobs/Jobs';
import DetailJob from './pages/DetailJob/DetailJob';
import DetailCompany from './pages/DetailCompany/DetailCompany';
import ChangePassword from './pages/ChangePassword/ChangePassword';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/detailJob/:jobId" element={<DetailJob />}/>
          <Route path="/detailCompany/:id" element={<DetailCompany />}/>
          <Route path="/changePassword" element={<ChangePassword />}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
