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
import SavedJobs from './pages/SavedJobs/SavedJobs';
import AppliedJobs from './pages/AppliedJobs/AppliedJobs';
import CreatePostJob from './pages/CreatePostJob/CreatePostJob';
import PostedJobs from './pages/PostedJobs/PostedJobs';
import PostedDetail from './pages/PostedDetail/PostedDetail';
import CandidateApply from './pages/CandidateApply/CandidateApply';
import DetailCandidate from './pages/DetailCandidate/DetailCandidate';
import EditPost from './pages/EditPost/EditPost';
import AdminLayout from './pages/Admin/AdminLayout/AdminLayout';
import DetailCandidateSearch from './pages/DetailCandidateSearch/DetailCandidateSearch.jsx';
import DetailJobAdmin from './pages/Admin/DetailJobAdmin/DetailJobAdmin.jsx';
import ViewEdit from './pages/ViewEdit/ViewEdit.jsx';

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
            <Route path="/savedJobs" element={<SavedJobs />}/>
            <Route path="/appliedJobs" element={<AppliedJobs />}/>
            <Route path="/createPostJob" element={<CreatePostJob />}/>
            <Route path="/postedJobs" element={<PostedJobs />}/>
            <Route path="/postedDetail/:jobId" element={<PostedDetail />}/>
            <Route path="/candidateApply/:candidateId" element={<CandidateApply />}/>
            <Route path="/detailCandidate/:candidateId" element={<DetailCandidate />}/>
            <Route path="/detail-candidate/:candidateId" element={<DetailCandidateSearch />}/>
            <Route path="/detailJobAdmin/:jobId" element={<DetailJobAdmin />}/>
            <Route path="/editPost/:jobId" element={<EditPost />}/>
            <Route path="/viewEdit/:jobId" element={<ViewEdit />}/>
            <Route path="/admin" element={<AdminLayout />}/>
          </Routes>
        </div>
      </Router>
  );
}

export default App;
