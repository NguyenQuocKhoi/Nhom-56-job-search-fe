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
  const [skills, setSkills] = useState([]);

  // const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchJobAndCandidates = async () => {
      try {
        const resultJobs = await getAPiNoneToken(`/job/${jobId}`);
        setJob(resultJobs.data.job);
        console.log(resultJobs);
        
        //Lấy tên category
        if (resultJobs.data.job.category) {
          const categoryData = await getAPiNoneToken(`/category/${resultJobs.data.job.category}`);
          const categoryName = categoryData.data.category.name;
          setCategoryName(categoryName);
        } else {
          setCategoryName('No category');
        }
  
        const resultApplies = await getApiWithToken(`/application/get-applications-by-job/${jobId}`);
        const applicationsWithCandidates = await Promise.all(resultApplies.data.applications.map(async (apply) => {
          const candidateResult = await getApiWithToken(`/candidate/${apply.candidate}`);
          apply.candidateInfo = candidateResult.data.candidate;
          
          return apply;
        }));
  
        setApply(applicationsWithCandidates);
        console.log(applicationsWithCandidates);
  // const skillPromises = result.data.job.requirements.map(async (skillId) => {
          //   const skillResult = await getAPiNoneToken(`/skill/${skillId}`);
          //   return skillResult.data.skill.skillName;
          // });
          
          // const fetchedSkills = await Promise.all(skillPromises);
          // setSkills(fetchedSkills);
          if (resultJobs.data.job.requirements && resultJobs.data.job.requirements.length > 0) {
            const skillPromises = resultJobs.data.job.requirements.map(async (skillId) => {
              const skillResult = await getAPiNoneToken(`/skill/${skillId}`);
              return skillResult.data.skill.skillName;
            });

            const fetchedSkills = await Promise.all(skillPromises);
            setSkills(fetchedSkills);
          } else {
            setSkills([]); // Không có kỹ năng
          }
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

  const handleViewEdit = () => {
    if (job.pendingUpdates) {
      navigate(`/viewEdit/${jobId}`);
    } 
    // else {
    //   setIsButtonDisabled(true);
      // Swal.fire({
      //   title: 'No Changes',
      //   text: 'This job does not have any pending updates.',
      //   icon: 'info',
      //   confirmButtonText: 'OK',
      // });
    // }
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
          <p><strong>Address:</strong> {job.address}</p>
          <p><strong>Company:</strong> {job.company.name}</p>
          <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
          <p><strong>Expires:</strong> {new Date(job.expiredAt).toLocaleDateString()}</p>
          <p><strong>Number of cruiment:</strong> {job.numberOfCruiment}</p>
          <p><strong>Salary:</strong> ${job.salary}</p>
          <p><strong>Type:</strong> {job.type}</p>
          <p><strong>Position:</strong> {job.position}</p>
          <p><strong>Experience Level:</strong> {job.experienceLevel}</p>
          <p><strong>Category:</strong> {categoryName || 'No Category'}</p>
          <div>
          <strong>Requirements: </strong>
          {skills.length > 0 ? (
            <ul>
              {skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          ) : (
            <span>No skill</span>
          )}
          <p><strong>Description:</strong> {job.description}</p>
        </div>
          <button onClick={handleEditPost}>Sửa bài đăng</button>
          <button onClick={handleDeletePost}>Xóa bài đăng</button>
          <button 
            onClick={handleViewEdit}
            // disabled={isButtonDisabled}
            disabled={!job.pendingUpdates}
          >
            Xem chi tiết sửa
          </button>
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
