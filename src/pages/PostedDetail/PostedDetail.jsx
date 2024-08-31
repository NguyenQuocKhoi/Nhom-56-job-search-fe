import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './postedDetail.module.scss';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getAPiNoneToken, getApiWithToken, deleteApiWithToken } from '../../api';
import Swal from 'sweetalert2';

const PostedDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchJobAndCandidates = async () => {
      try {
        const result = await getAPiNoneToken(`/job/${jobId}`);
        setJob(result.data.job);

        const candidatesData = await Promise.all(
          result.data.job.applications.map(async (applicationId) => {
            try {
              const applicationRes = await getApiWithToken(`/application/${applicationId}`);
              if (!applicationRes.data.application) {
                return null;
              }

              const candidateRes = await getApiWithToken(`/candidate/${applicationRes.data.application.candidate}`);
              if (!candidateRes.data.candidate) {
                return null;
              }

              return {
                ...candidateRes.data.candidate,
                applicationId // Add applicationId here
              };
            } catch (err) {
              console.error(`Failed to fetch candidate for application ${applicationId}:`, err);
              return null;
            }
          })
        );

        setCandidates(candidatesData.filter(candidate => candidate !== null));
      } catch (err) {
        setError('Failed to fetch job details');
      }
    };

    fetchJobAndCandidates();
  }, [jobId]);

  if (error) return <div>{error}</div>;
  if (!job) return <div>Job not found</div>;

  const handleEditPost = () => {
    navigate(`/editPost/${jobId}`);
  };

  const handleDeletePost = async () => {
    try {
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn muốn xóa bài đăng này?',
        text: "Hành động này không thể hoàn tác!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        const response = await deleteApiWithToken(`/job/delete/${jobId}`);
        
        if (response.data.success) {
          Swal.fire(
            'Đã xóa!',
            'Bài đăng đã được xóa thành công.',
            'success'
          );
          navigate('/postedJobs');
        } else {
          Swal.fire(
            'Lỗi!',
            response.data.message,
            'error'
          );
        }
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
      Swal.fire(
        'Lỗi!',
        'Đã xảy ra lỗi khi xóa bài đăng.',
        'error'
      );
    }
  };

  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <p>Chi tiết công việc: {jobId}</p>

        <div className={clsx(styles.jobDetail)}>
          <div className={clsx(styles.titleContainer)}>
            <div className={clsx(styles.title)}>
              <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)} />
              <h1>{job.title}</h1>
            </div>
          </div>
          <p><strong>Description:</strong> {job.description}</p>
          <p><strong>Address:</strong> {job.address}</p>
          <p><strong>Company:</strong> {job.company.name}</p>
          <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
          <p><strong>Expires:</strong> {new Date(job.expiredAt).toLocaleDateString()}</p>
          <p><strong>Salary:</strong> ${job.salary}</p>
          <p><strong>Type:</strong> {job.type}</p>
          <p><strong>Position:</strong> {job.position}</p>
          <p><strong>Experience Level:</strong> {job.experienceLevel}</p>
          <div>
            <strong>Requirements:</strong>
            <ul>
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
          <button onClick={handleEditPost}>Sửa bài đăng</button>
          <button onClick={handleDeletePost}>Xóa bài đăng</button>
        </div>

        <div>
          <strong>Danh sách ứng viên:</strong>
          {candidates.length > 0 ? (
            <ul>
              {candidates.map((candidate, index) => (
                <Link key={index} to={`/detailCandidate/${candidate._id}?applicationId=${candidate.applicationId}`}>
                  <div>
                    <p><strong>Name:</strong> {candidate.name}</p>
                    <p><strong>Email:</strong> {candidate.email}</p>
                    <p><strong>Phone Number:</strong> {candidate.phoneNumber}</p>
                    <p><strong>Address:</strong> {candidate.address}</p>
                    <p>Status: {candidate.status}</p>
                  </div>
                </Link>
              ))}
            </ul>
          ) : (
            <p>No candidates found for this job.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PostedDetail;
