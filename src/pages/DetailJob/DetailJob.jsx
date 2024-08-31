import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAPiNoneToken, getApiWithToken, postApiWithToken, putApiWithToken } from '../../api'; // Assuming you have these API functions
import styles from './detailJob.module.scss';
import clsx from 'clsx';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import ListJobInfo from '../../components/ListJobInfo/ListJobInfo';
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

  const userData = getUserStorage()?.user;//

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchJob = async () => {
      try {
        const result = await getAPiNoneToken(`/job/${jobId}`);
        setJob(result.data.job);
      } catch (err) {
        setError('Failed to fetch job details');
      }
    };

    fetchJob();
    // name1();

    const userData = getUserStorage()?.user;
    setUserRole(userData?.role);
    setUserId(userData?._id);

    setProfileComplete(true);//true
    setCvExists(true);//true
  }, [jobId]);

  // const [profile, setProfile] = useState()
  // const name1 = async () => {
  //   const candidateProfile = await getApiWithToken(`/candidate/${userData._id}`);
  //   const profile = candidateProfile.data.candidate;
  //   setProfile(profile)
  // }

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: `/detailJob/${jobId}` } });
  };
  
  //
  // const [name, setName] = useState('');
  // const [email, setEmail] = useState('');
  // const [phoneNumber, setPhoneNumber] = useState('');
  // const handleProfileUpdate1 = () => {
    
  // }

  const handleProfileUpdate = async () => {//chưa cập nhật được profile
    try {
      // Gọi API để lấy thông tin profile của ứng viên
      const candidateProfile = await getApiWithToken(`/candidate/${userData._id}`);
      const profile = candidateProfile.data.candidate;
      
      console.log(profile.email);
      console.log(1);
      console.log(profile); 
      // Chuẩn bị các phần tử HTML cho các trường bị rỗng
      let htmlContent = '';

      if (profile.name) {
        htmlContent += `<input id="swal-input1" class="swal2-input" value="${profile.name}">`;
        console.log(65, profile.name)
      }
      if (profile.phoneNumber) {
        htmlContent += `<input id="swal-input2" class="swal2-input" placeholder="Số điện thoại">`;
      }
      if (profile.email) {
        htmlContent += `${profile.email}`;
      }
      // if (!profile.address) {
      //   htmlContent += `<input id="swal-input2" class="swal2-input" placeholder="Địa chỉ">`;
      // }
      // if (!profile.experience) {
      //   htmlContent += `<input id="swal-input3" class="swal2-input" placeholder="Kinh nghiệm">`;
      // }
      // if (!profile.skill) {
      //   htmlContent += `<input id="swal-input4" class="swal2-input" placeholder="Kỹ năng">`;
      // }
      // if (!profile.education) {
      //   htmlContent += `<input id="swal-input5" class="swal2-input" placeholder="Học vấn">`;
      // }
      // if (!profile.moreInformation) {
      //   htmlContent += `<input id="swal-input6" class="swal2-input" placeholder="Thông tin thêm">`;
      // }
      if (!profile.resume) {
        htmlContent += `<input type="file" id="swal-input3" class="swal2-input" accept="application/pdf">`;
      }
  
      // Nếu có bất kỳ trường nào bị rỗng, hiển thị modal
      if (htmlContent) {
        const { value: formValues } = await Swal.fire({
          title: 'Cập nhật thông tin profile',
          html: htmlContent,
          focusConfirm: false,
          preConfirm: () => {
            const name = profile.name ? profile.name : document.getElementById('swal-input1')?.value;
            console.log(99, name)
            const phoneNumber = profile.phoneNumber ? profile.phoneNumber : document.getElementById('swal-input2')?.value;
            const email = profile.email;
            // const address = profile.address ? profile.address : document.getElementById('swal-input2')?.value;
            // const experience = profile.experience ? profile.experience : document.getElementById('swal-input3')?.value;
            // const skill = profile.skill ? profile.skill : document.getElementById('swal-input4')?.value;
            // const education = profile.education ? profile.education : document.getElementById('swal-input5')?.value;
            // const moreInformation = profile.moreInformation ? profile.moreInformation : document.getElementById('swal-input6')?.value;
            const cvFile = document.getElementById('swal-input3')?.files[0];
  
            // return { phoneNumber, address, experience, skill, education, moreInformation, cvFile };
            console.log(109, name);
            return { name, phoneNumber, email, cvFile };
          }
        });
        

        // Nếu người dùng cập nhật thông tin
        if (formValues) {
          // const { phoneNumber, address, experience, skill, education, moreInformation, cvFile } = formValues;
          const { name, phoneNumber, cvFile } = formValues;
  
          console.log(118, name)
          // Cập nhật thông tin profile
          await putApiWithToken(`/candidate/update/${userData._id}`, {
            name,
            phoneNumber,
            // address,
            // experience,
            // skill,
            // education,
            // moreInformation,
          });
  
          // Nếu có file CV được chọn, thì upload file CV
          if (cvFile) {
            const formData = new FormData();
            formData.append('resume', cvFile);
            await putApiWithToken(`/candidate/upload-cv/${userData._id}`, formData);
          }
  
          Swal.fire({
            icon: 'success',
            text: 'Profile đã được cập nhật thành công!',
          });
        }
      } else {
        // Nếu profile đã hoàn tất, tiếp tục với logic ứng tuyển
        await postApiWithToken(`/application/create`, { 
          jobId: job._id,
          candidateId: userId,
        });
        Swal.fire('Ứng tuyển thành công!', '', 'success');
        setIsApplied(true);

        console.log('Profile is complete');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      Swal.fire({
        icon: 'error',
        text: 'Đã xảy ra lỗi khi cập nhật profile. Vui lòng thử lại sau.',
      });
    }
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
              <button className={clsx(styles.btnSave)}>
                <i className="fa-regular fa-heart"></i>
                <p><strong>Lưu tin</strong></p>
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
        {/* chưa lấy được category */}
        <p><strong>Category: </strong>{job.category}</p>
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
      <span>Other Jobs</span>
      <ListJobInfo />
      <Footer />
    </>
  );
};

export default JobDetail;
