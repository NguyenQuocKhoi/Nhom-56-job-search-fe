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
  // const [candidates, setCandidates] = useState([]);
  const [apply, setApply] = useState([])
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchJobAndCandidates = async () => {
      try {
        const resultJobs = await getAPiNoneToken(`/job/${jobId}`);
        setJob(resultJobs.data.job);
        console.log(resultJobs);
        
        //
        const categoryData = await getApiWithToken(`/category/${resultJobs.data.job.category}`);//đã đăng nhập with hay none đều được
        const categoryName = categoryData.data.category.name;
        setCategoryName(categoryName); //
  
        const resultApplies = await getApiWithToken(`/application/get-applications-by-job/${jobId}`);
        const applicationsWithCandidates = await Promise.all(resultApplies.data.applications.map(async (apply) => {
          const candidateResult = await getApiWithToken(`/candidate/${apply.candidate}`);
          apply.candidateInfo = candidateResult.data.candidate;
          
          return apply;
        }));
  
        setApply(applicationsWithCandidates);
        console.log(applicationsWithCandidates);
  
      } catch (err) {
        setError('Failed');
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
          <p><strong>Category:</strong> {categoryName}</p>
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
{/*  */}
        <div>
  <strong>Danh sách ứng viên:</strong>
  {apply.length > 0 ? (
    <ul>
      {apply.map((apply, index) => (
        <Link key={index} to={`/detailCandidate/${apply.candidate}?applicationId=${apply._id}`}>
          {/* <Link key={index} to={`/detailCandidate/${candidate._id}?applicationId=${candidate.applicationId}`}></Link> */}
        {/* <li> */}
          <div>
            {/* <a href={apply.resume} target='_blank' rel="noopener noreferrer">CV</a> */}
            <p>{apply.candidateInfo.name}</p> {/* Hiển thị tên ứng viên */}
            <p>{apply.candidateInfo.email}</p> {/* Hiển thị email của ứng viên */}
            <p>{apply.status}</p>
          </div>
          <hr />
        {/* </li> */}
        
        </Link>
      ))}
    </ul>
  ) : (
    <p>No candidates found for this job.</p>
  )}
</div>
          {/*  */}

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PostedDetail;
