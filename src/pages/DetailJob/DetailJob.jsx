import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { deleteApiWithToken, getAPiNoneToken, getApiWithToken, postApiWithToken, putApiWithToken } from '../../api';
import styles from './detailJob.module.scss';
import clsx from 'clsx';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { getUserStorage } from '../../Utils/valid';

const JobDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);//true
  const [cvExists, setCvExists] = useState(false);//
  const navigate = useNavigate();
  const [isApplied, setIsApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchJob = async () => {
      try {
        const result = await getAPiNoneToken(`/job/${jobId}`);
        if (result.data.job) {
          setJob(result.data.job);
  
          const categoryId = result.data.job.category;
          if (categoryId) {
            const categoryResult = await getAPiNoneToken(`/category/${categoryId}`);

            // console.log(categoryResult.data.category.name);
            setCategoryName(categoryResult.data.category.name);
          } else {
            setCategoryName("Unknown Category");
          }
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Failed to fetch job details');
      }
    };
    
    fetchJob();
    
    const userData = getUserStorage()?.user;
    setUserRole(userData?.role);
    setUserId(userData?._id);

    setProfileComplete(true);//true
    setCvExists(true);//true
  }, [jobId]);

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: `/detailJob/${jobId}` } });
  };
  
  const handleProfileUpdate = async () => {
    //check cv
  };

  const handleCvOption = async () => {
    const result = await Swal.fire({
      title: 'Sử dụng CV hiện có hay CV mới?',
      text: 'Chọn một trong các tùy chọn dưới đây.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sử dụng CV hiện có',
      cancelButtonText: 'Upload CV mới'
    });

    if (result.isConfirmed) {
      handleApplyWithExistingCv();
    } else {
      handleUploadNewCv();
    }
  };

  const handleApplyWithExistingCv = async () => {
    try {
      await postApiWithToken(`/application/create`, { 
        jobId: job._id,
        candidateId: userId,
      });
      Swal.fire('Ứng tuyển thành công!', '', 'success');
      setIsApplied(true);
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể gửi đơn ứng tuyển', 'error');
    }
  };

  const handleUploadNewCv = async () => {
    const candidateId = getUserStorage().user._id;

    const result = await Swal.fire({
      title: 'Upload CV mới',
      input: 'file',
      inputAttributes: {
        accept: '.pdf, .doc, .docx',
        'aria-label': 'Upload CV mới'
      },
      showCancelButton: true,
      confirmButtonText: 'Upload',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      const file = result.value;
      const formData = new FormData();
      formData.append('resume', file);

      try {
        await putApiWithToken(`/candidate/upload-cv/${candidateId}`, formData);
        

        await postApiWithToken(`/application/create`, { 
          jobId: job._id,
          candidateId: candidateId,
        });
        Swal.fire('Ứng tuyển thành công!', '', 'success');
        setIsApplied(true);
      } catch (error) {
        Swal.fire('Lỗi', 'Không thể upload CV hoặc gửi đơn ứng tuyển', 'error');
      }
    }
  };

  const handleApply = async () => {
    const userData = getUserStorage()?.user;

    if (!userData) {
      handleLoginRedirect();
      return;
    }

    if (!profileComplete) {
      await handleProfileUpdate();
      return;
    }

    if (cvExists) {
      await handleCvOption();
    } else {
      await handleUploadNewCv();
    }
  };

  const handleSaveJob = async () => {
    const userData = getUserStorage()?.user;
  
    if (!userData) {
      handleLoginRedirect();
      return;
    }
  
    let savedJobs = [];
  
    try {
      console.log("User data id:", userData._id);
  
      // Lấy danh sách công việc đã lưu
      const savedJobsResponse = await getApiWithToken(`/save-job/gets/${userData._id}`);
      savedJobs = savedJobsResponse?.data?.savedJobs || [];
    } catch (error) {
      console.error("Lỗi khi lấy danh sách công việc đã lưu:", error);
      // Xử lý lỗi: Gán savedJobs thành mảng rỗng nếu không thể lấy được dữ liệu
      savedJobs = [];
    }
  
    try {
      // Kiểm tra xem công việc hiện tại đã được lưu chưa
      const savedJob = savedJobs.find(savedJob => savedJob.job === job._id);
      console.log("Saved jobs:", savedJobs);
      console.log("Saved job:", savedJob);//chưa lưu thì undifined
  
      if (savedJob) {
        // Nếu công việc đã được lưu, thực hiện bỏ lưu
        await deleteApiWithToken(`/save-job/delete/${savedJob._id}`);
        setIsSaved(false);
        Swal.fire('Đã bỏ lưu tin!', '', 'success');
      } else {
        // Nếu công việc chưa được lưu, thực hiện lưu công việc
        await postApiWithToken(`/save-job/create`, { 
          candidateId: userData._id,
          jobId: job._id
        });
        setIsSaved(true);
        Swal.fire('Lưu tin thành công!', '', 'success');
      }
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể lưu tin hoặc bỏ lưu tin', 'error');
    }
  };
  
  if (error) return <div>{error}</div>;
  if (!job) return <div>Job not found</div>;

  

  return (
    <>
      
      <Header />
      <div className={clsx(styles.jobDetail)}>
        <div className={clsx(styles.titleContainer)}>
          <div className={clsx(styles.title)}>
            <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)} />
            <h1>{job.title}</h1>
          </div>
          {(userRole === 'candidate' || !userRole) && (
            <div className={clsx(styles.title)}>
              <button 
                className={clsx(styles.btn)} 
                onClick={handleApply} 
                disabled={isApplied}//cho nó thành cái khác
              >
                <strong>Ứng tuyển ngay</strong>
              </button>
              <button 
                className={clsx(styles.btnSave)}
                onClick={handleSaveJob}>
                <i className={clsx(isSaved ? 'fa-solid fa-heart' : 'fa-regular fa-heart')}></i>
                <p><strong>{isSaved ? 'Bỏ lưu' : 'Lưu tin'}</strong></p>
              </button>
            </div>
          )}
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
        <p><strong>Category: </strong>{categoryName}</p>
        <div>
          <strong>Requirements:</strong>
          <ul>
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
        <p><strong>Number of cruiment:</strong> {job.numberOfCruiment}</p>
      </div>
      <Footer />
    </>
  );
};

export default JobDetail;
