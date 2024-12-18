import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteApiWithToken, getAPiNoneToken, putApiWithToken } from '../../../api';
import styles from './detailJobAdmin.module.scss';
import clsx from 'clsx';
import Header from '../HeaderAdmin/HeaderAdmin';
import Swal from 'sweetalert2';
import Loading from '../../../components/Loading/Loading';

const DetailJobAdmin = () => {
  const navigate = useNavigate();

  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  // const [userRole, setUserRole] = useState(null);
  // const [userId, setUserId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryNameEdited, setCategoryNameEdited] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillsEdited, setSkillsEdited] = useState([]);

  //
  const [buttonState, setButtonState] = useState('pending');

  //
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchJob = async () => {
      try {
        setLoading(true)
        const result = await getAPiNoneToken(`/job/${jobId}`);
        if (result.data.job) {
          setJob(result.data.job);

          // console.log(result.data.job);
          setButtonState(result.data.job.status);          
  
          const categoryId = result.data.job.category;
          if (categoryId) {
            const categoryResult = await getAPiNoneToken(`/category/${categoryId}`);
            setCategoryName(categoryResult.data.category.name);
            // console.log(categoryResult.data.category.name);

            if(result.data.job.pendingUpdates?.category){
              const categoryResultEdited = await getAPiNoneToken(`category/${result.data.job.pendingUpdates.category}`)
              setCategoryNameEdited(categoryResultEdited.data.category.name);
            }
          } else {
            setCategoryName("Unknown Category");
          }

          // const skillPromises = result.data.job.requirements.map(async (skillId) => {
          //   const skillResult = await getAPiNoneToken(`/skill/${skillId}`);
          //   return skillResult.data.skill.skillName;
          // });
          
          // const fetchedSkills = await Promise.all(skillPromises);
          // setSkills(fetchedSkills);
          if (result.data.job.requirementSkills && result.data.job.requirementSkills.length > 0) {
            const skillPromises = result.data.job.requirementSkills.map(async (skillId) => {
              const skillResult = await getAPiNoneToken(`/skill/${skillId}`);
              return skillResult.data.skill.skillName;
            });

            const fetchedSkills = await Promise.all(skillPromises);
            setSkills(fetchedSkills);
          } else {
            setSkills([]); // Không có kỹ năng
          }
          //pendingUpdates
          if (result.data.job.pendingUpdates?.requirementSkills && result.data.job.pendingUpdates.requirementSkills.length > 0) {
            const skillPromisesEdited = result.data.job.pendingUpdates.requirementSkills.map(async (skillId) => {
              const skillResultEdited = await getAPiNoneToken(`/skill/${skillId}`);
              return skillResultEdited.data.skill.skillName;
            });

            const fetchedSkillsEdited = await Promise.all(skillPromisesEdited);
            setSkillsEdited(fetchedSkillsEdited);
          } 
          // else {
          //   setSkillsEdited([]); // Không có kỹ năng
          // }
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Failed to fetch job details');
      } finally{
        setLoading(false);
      }
    };
    
    fetchJob();
    
    // const userData = getUserStorage()?.user;
    // setUserRole(userData?.role);
    // setUserId(userData?._id);
  }, [jobId]);

  // const renderField = (label, originalValue, updatedValue) => {
  //   return (
  //     <p>
  //       <strong>{label}:</strong> {originalValue}
  //       {updatedValue !== undefined && updatedValue !== originalValue && (
  //         <span style={{ backgroundColor: 'yellow', paddingLeft: '10px' }}>
  //           (Cập nhật thành: {updatedValue})
  //         </span>
  //       )}
  //     </p>
  //   );
  // };
  const renderField = (label, value, pendingValue, isHtml = false) => {
    return (
      <div>
        <label><strong>{label}:</strong></label>
        {pendingValue ? (
          // <div style={{ color: 'red' }}>
          <div>
            {isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: pendingValue }}></div>
            ) : (
              <p>{pendingValue}</p>
            )}
          </div>
        ) : (
          <div>
            {isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: value }}></div>
            ) : (
              <p>{value}</p>
            )}
          </div>
        )}
      </div>
    );
  };  

  //accept, reject job
  const handleStatusUpdate = async ( jobId, status ) => {
    // Hiển thị thông báo ngay lập tức khi người dùng nhấn nút
    Swal.fire({
      // title: `${status === 'accepted' ? 'Accepting' : 'Rejecting'}...`,
      title: 'Đang xử lí',
      text: `Please wait while ${status} the job.`,
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await putApiWithToken('/job/update-status', { jobId, status });

      setButtonState(status);
      Swal.fire({
        icon: 'success',
        title: status === true ? 'Accepted' : 'Rejected',//true
        text: `You have ${status} this job.`,
      });

      navigate(-1);//tạm thời
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to ${status} the job.`,
      });
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn muốn xóa công việc này?',
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

  if (error) return <div>{error}</div>;
  // if (!job) return <div>Không tìm thấy công việc</div>;
  if (!job) return <div>{loading ? <Loading /> : null}</div>;

  return (
    <>
      <Header/>
      <div className={clsx(styles.jobDetail)}>
        <div className={clsx(styles.columnOne)}>
          <div className={clsx(styles.titleContainer)}>
            <div className={clsx(styles.title)}>
              <div className={clsx(styles.tenCV)}>
                <h1>{job.title}</h1>
                {
                  job.pendingUpdates?.title && job.pendingUpdates.title !== job.title && (
                    <h1 
                      // style={{backgroundColor: 'yellow'}}
                    >Tên mới: {job.pendingUpdates.title}</h1>
                  )
                }
              </div>
            </div>
            <div className={clsx(styles.ngang)}>
              {/* {renderField('Expires', new Date(job.expiredAt).toLocaleDateString('vi-VN'), new Date(job.pendingUpdates?.expiredAt).toLocaleDateString('vi-VN'))} */}
              {renderField(
                'Hạn nộp hồ sơ', 
                job.expiredAt ? new Date(job.expiredAt).toLocaleDateString('vi-VN') : 'Chưa có ngày hết hạn', 
                job.pendingUpdates?.expiredAt ? new Date(job.pendingUpdates.expiredAt).toLocaleDateString('vi-VN') : null
              )}
              {renderField('Lương', job.salary, job.pendingUpdates?.salary)}
              {renderField('Vị trí', job.position, job.pendingUpdates?.position)}
            </div>
          </div>
          <div className={clsx(styles.thongtinchinh)}>
            {renderField('Phúc lợi', job.interest, job.pendingUpdates?.interest, true)}
            {renderField('Mô tả', job.description, job.pendingUpdates?.description, true)}
            {renderField('Yêu cầu', job.requirements, job.pendingUpdates?.requirements, true)}
            <p><strong>Ngày đăng:</strong> {new Date(job.createdAt).toLocaleDateString('vi-VN')}</p>
            {/* {renderField('Expires', new Date(job.expiredAt).toLocaleDateString('vi-VN'), new Date(job.pendingUpdates?.expiredAt).toLocaleDateString('vi-VN'))}             */}
            {renderField(
              'Hạn nộp hồ sơ', 
              job.expiredAt ? new Date(job.expiredAt).toLocaleDateString('vi-VN') : 'Chưa có ngày hết hạn', 
              job.pendingUpdates?.expiredAt ? new Date(job.pendingUpdates.expiredAt).toLocaleDateString('vi-VN') : null
            )}
          </div>
        </div>

        <div className={clsx(styles.columnTwo)}>
          <div className={clsx(styles.companyContainer)}>
            <div className={clsx(styles.titleCongty)}>
              <Link to={`/detailCompanyAdmin/${job?.company._id}`} target="_blank" rel="noopener noreferrer">
                <img src={job.company.avatar} alt="Logo" className={clsx(styles.avatar)} />
              </Link>
              <p><strong></strong> {job.company.name}</p>
            </div>
            {/* {renderField('Address', `${job.street}, ${job.city}`, `${job.pendingUpdates?.street}, ${job.pendingUpdates?.city}`)} */}
            {renderField(
              'Địa chỉ', 
              `${job.street || 'Chưa có địa chỉ'}, ${job.city || ''}`, 
              job.pendingUpdates ? `${job.pendingUpdates.street || 'Chưa cập nhật địa chỉ'}, ${job.pendingUpdates.city || ''}` : null
            )}
          </div>

          <div className={clsx(styles.thongtinchung)}>
            {renderField('Hình thức làm việc', job.type, job.pendingUpdates?.type)}
            {renderField('Số lượng tuyển', job.numberOfCruiment, job.pendingUpdates?.numberOfCruiment)}
            {renderField('Kinh nghiệm', job.experienceLevel, job.pendingUpdates?.experienceLevel)}
          </div>

          <div className={clsx(styles.them)}>
            {renderField('Lĩnh vực', categoryName, categoryNameEdited)}
            <div>
              <strong>Yêu cầu kỹ năng: </strong>
              {skills.length > 0 ? (
                <ul>
                  {skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <span>Không có yêu cầu kỹ năng</span>
              )}
            </div>
            <div>
              <strong>Yêu cầu kỹ năng cập nhật: </strong>
              {skillsEdited.length > 0 ? (
                <ul>
                  {skillsEdited.map((skill, index) => (
                    <li key={index} 
                      // style={{ backgroundColor: 'yellow' }}
                    >{skill}</li>
                  ))}
                </ul>
              ) : (
                <span>Không có cập nhật</span>
              )}
            </div>
          </div>
        </div>
        
      </div>

      <div className={clsx(styles.buttonContainer)}>
        <button
          className={clsx(styles.button, 
            job.pendingUpdates !== null
              ? null
              : {
                  [styles.accepted]: buttonState === true,
                  // [styles.disabled]: buttonState === 'rejected'
                }
          )}
          onClick={() => handleStatusUpdate(job._id, true)}
        >
          Đồng ý
        </button>
        <button
          className={clsx(styles.button, 
            job.pendingUpdates !== null
              ? null
              : {
                  [styles.rejected]: buttonState === false,
                  // [styles.disabled]: buttonState === 'accepted'
                }
          )}
          onClick={() => handleStatusUpdate(job._id, false)}
        >
          Từ chối
        </button>

        <button onClick={() => handleDeleteJob(job._id)} className={clsx(styles.buttonXoa)}>Xóa</button>
      </div>
    </>
  );
};

export default DetailJobAdmin;

