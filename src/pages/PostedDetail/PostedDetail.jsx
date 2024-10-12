import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './postedDetail.module.scss';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getAPiNoneToken, getApiWithToken, deleteApiWithToken } from '../../api';
import Swal from 'sweetalert2';
import logo from '../../images/logo.png';

const PostedDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  // const [candidates, setCandidates] = useState([]);
  const [apply, setApply] = useState([])
  const navigate = useNavigate();

  const [categoryName, setCategoryName] = useState('');
  const [skills, setSkills] = useState([]);

  const [numberApplyPending, setNumberApplyPending] = useState(0);

  // const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchJobAndCandidates = async () => {
      try {
        const resultJobs = await getAPiNoneToken(`/job/${jobId}`);
        setJob(resultJobs.data.job);
        console.log(resultJobs);
        
        //Lấy tên category
        // if (resultJobs.data.job.category) {
        //   const categoryData = await getAPiNoneToken(`/category/${resultJobs.data.job.category}`);
        //   const categoryName = categoryData.data.category.name;
        //   setCategoryName(categoryName);
        // } else {
        //   setCategoryName('No category');
        // }
        if (resultJobs.data.job.pendingUpdates && resultJobs.data.job.pendingUpdates.category) {
          const categoryData = await getAPiNoneToken(`/category/${resultJobs.data.job.pendingUpdates.category}`);
          const categoryName = categoryData.data.category.name;
          setCategoryName(categoryName);
        } else if (resultJobs.data.job.category) {
          const categoryData = await getAPiNoneToken(`/category/${resultJobs.data.job.category}`);
          const categoryName = categoryData.data.category.name;
          setCategoryName(categoryName);
        } else {
          setCategoryName('No category');
        }
        
  
        // console.log(1);
        
        const resultApplies = await getApiWithToken(`/application/get-applications-by-job/${jobId}`);
        console.log(resultApplies);
        
        const applicationsWithCandidates = await Promise.all(resultApplies.data.applications.map(async (apply) => {
          const candidateResult = await getApiWithToken(`/candidate/${apply.candidate}`);
          apply.candidateInfo = candidateResult.data.candidate;
          
          return apply;
        }));
  
        setApply(applicationsWithCandidates);
        console.log(applicationsWithCandidates);

        //đếm số lượng ứng viên có trạng thái "pending"
        const pendingApplications = applicationsWithCandidates.filter(apply => apply.status === 'pending');
        setNumberApplyPending(pendingApplications.length);

  // const skillPromises = result.data.job.requirements.map(async (skillId) => {
          //   const skillResult = await getAPiNoneToken(`/skill/${skillId}`);
          //   return skillResult.data.skill.skillName;
          // });
          
          // const fetchedSkills = await Promise.all(skillPromises);
          // setSkills(fetchedSkills);


          //
          // if (resultJobs.data.job.requirementSkills && resultJobs.data.job.requirementSkills.length > 0) {
          //   const skillPromises = resultJobs.data.job.requirementSkills.map(async (skillId) => {
          //     const skillResult = await getAPiNoneToken(`/skill/${skillId}`);
          //     return skillResult.data.skill.skillName;
          //   });

          //   const fetchedSkills = await Promise.all(skillPromises);
          //   setSkills(fetchedSkills);
          const requirementSkills = resultJobs.data.job.pendingUpdates?.requirementSkills || resultJobs.data.job.requirementSkills;
          if (requirementSkills && requirementSkills.length > 0) {
            const skillPromises = requirementSkills.map(async (skillId) => {
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

  const isFieldDifferent = (field) => job && job.pendingUpdates && job[field] !== job.pendingUpdates[field];

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
        {/* <p>Chi tiết công việc: {jobId}</p> */}
        <div className={clsx(styles.jobDetail)}>
        <div className={clsx(styles.columnOne)}>
          <div className={clsx(styles.titleContainer)}>
            <div className={clsx(styles.title)}>
              <h1 className={clsx({ [styles.highlight]: isFieldDifferent('title') })}>
                {job.pendingUpdates?.title || job.title}
              </h1>
            </div>

            <div className={clsx(styles.ngang)}>
              <p className={clsx({ [styles.highlight]: isFieldDifferent('expiredAt') })}>
                <strong>Expires:</strong> {new Date(job.pendingUpdates?.expiredAt || job.expiredAt).toLocaleDateString()}
              </p>
              <p className={clsx({ [styles.highlight]: isFieldDifferent('salary') })}>
                <strong>Salary:</strong> {job.pendingUpdates?.salary || job.salary}
              </p>
              <p className={clsx({ [styles.highlight]: isFieldDifferent('position') })}>
                <strong>Position:</strong> {job.pendingUpdates?.position || job.position}
              </p>
            </div>
          </div>

          <div className={clsx(styles.thongtinchinh)}>
            {/* <p className={clsx({ [styles.highlight]: isFieldDifferent('interest') })}>
              <strong>Interest:</strong> {job.pendingUpdates?.interest || job.interest}
            </p> */}
            <p><strong>Mô tả:</strong></p>
            <div
              className={clsx({ [styles.highlight]: isFieldDifferent('description') })}
              dangerouslySetInnerHTML={{ __html: job.pendingUpdates?.description || job.description }}
            ></div>
            <p><strong>Yêu cầu:</strong></p>            
            <div
              className={clsx({ [styles.highlight]: isFieldDifferent('requirements') })}
              dangerouslySetInnerHTML={{ __html: job.pendingUpdates?.requirements || job.requirements }}
            ></div>
            <p><strong>Phúc lợi:</strong></p>            
            <div
              className={clsx({ [styles.highlight]: isFieldDifferent('interest') })}
              dangerouslySetInnerHTML={{ __html: job.pendingUpdates?.interest || job.interest }}
            ></div>
            {/* <p className={clsx({ [styles.highlight]: isFieldDifferent('requirements') })}>
              <strong>Requirements:</strong> {job.pendingUpdates?.requirements || job.requirements}
            </p> */}
            <p><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</p>
            <p className={clsx({ [styles.highlight]: isFieldDifferent('expiredAt') })}>
              <strong>Expires:</strong> {new Date(job.pendingUpdates?.expiredAt || job.expiredAt).toLocaleDateString()}
            </p>
            {
              job.pendingUpdates &&
                (<p><strong>Last Modified:</strong> {new Date(job.pendingUpdates.lastModified).toLocaleString()}</p>)
              }
          </div>

          <div className={clsx(styles.groupButton)}>
            <button onClick={handleEditPost} className={clsx(styles.btnSua)}>Sửa bài đăng</button>
            <button onClick={handleDeletePost} className={clsx(styles.btnXoa)}>Xóa bài đăng</button>
          </div>
          <div className={clsx(styles.textChoPheDuyet)}>
            {job.pendingUpdates && <p>Đang chờ phê duyệt</p>}
          </div>
        </div>

          <div className={clsx(styles.columnTwo)}>
            <div className={clsx(styles.companyContainer)}>
              <div className={clsx(styles.titleCongty)}>
                <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)} />
                <p><strong>Company:</strong> {job.company.name}</p>
              </div>
              <p className={clsx({ [styles.highlight]: isFieldDifferent('city') })}>
                <strong>Address:</strong> {job.pendingUpdates?.street || job.street}, {job.pendingUpdates?.city || job.city}
              </p>
            </div>
          

          <div className={clsx(styles.thongtinchung)}>
            <p className={clsx({ [styles.highlight]: isFieldDifferent('type') })}>
              <strong>Hình thức làm việc:</strong> {job.pendingUpdates?.type || job.type}
            </p>
            <p className={clsx({ [styles.highlight]: isFieldDifferent('numberOfCruiment') })}>
              <strong>Số lượng tuyển:</strong> {job.pendingUpdates?.numberOfCruiment || job.numberOfCruiment}
            </p>
            <p className={clsx({ [styles.highlight]: isFieldDifferent('experienceLevel') })}>
              <strong>Kinh nghiệm:</strong> {job.pendingUpdates?.experienceLevel || job.experienceLevel}
            </p>
          </div>

          <div className={clsx(styles.them)}>
            <p className={clsx({ [styles.highlight]: isFieldDifferent('category') })}>
              <strong>Lĩnh vực:</strong> {categoryName || 'No Category'}
            </p>
            <div>
              <strong>Yêu cầu kỹ năng: </strong>
              {skills.length > 0 ? (
                <ul>
                  {skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <span>No skill</span>
              )}
            </div>
          </div>
          </div>
          
        </div>

        <div>
{/*  */}
        <div>
            {apply.length > 0 ? (
              <div className={clsx(styles.joblist)}>
            <div className={clsx(styles.ds)}>
              <strong>Số lượng ứng viên chờ phê duyệt: {numberApplyPending}</strong>
              <strong>Danh sách ứng viên:</strong>
            </div>
                  <div className={clsx(styles.jobContainer)}>
                    {apply.map((apply, index) => (
                      <Link key={index} to={`/detailCandidate/${apply.candidate}?applicationId=${apply._id}`} className={clsx(styles.jobcard)} target="_blank" rel="noopener noreferrer">
                        {/* <Link key={index} to={`/detailCandidate/${candidate._id}?applicationId=${candidate.applicationId}`}></Link> */}
                        {/* <div className={clsx(styles.s)}> */}
                          <img src={apply.candidateInfo.avatar || logo} alt="Logo" className={clsx(styles.avatar)} />                        
                          <div>
                            {/* <a href={apply.resume} target='_blank' rel="noopener noreferrer">CV</a> */}
                            <p>{apply.candidateInfo.name}</p>
                            <p>{apply.candidateInfo.email}</p>
                            <p>{apply.candidateInfo.phoneNumber}</p>
                            <p>{apply.candidateInfo.street}, {apply.candidateInfo.city}</p>
                            {/* <p>{apply.status}</p> */}
                            <p 
                              style={{ 
                                backgroundColor: 
                                  apply.status === 'accepted' ? 'lightgreen' : 
                                  apply.status === 'rejected' ? 'lightcoral' : 
                                  'lightgray'
                              }}
                            >
                              Trạng thái: {apply.status}
                              
                              {apply.status === 'accepted' && <i className="fa-solid fa-check"></i>}
                              {apply.status === 'rejected' && <i className="fa-solid fa-x"></i>}
                              {apply.status === 'pending' && <i className="fa-regular fa-clock"></i>}
                            </p>
                          </div>
                        {/* </div> */}
                      </Link>
                    ))}
                  </div>
                </div>
            ) : (
              <div className={clsx(styles.ds)}>
                <strong>No candidates applied for this job.</strong>
              </div>
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
