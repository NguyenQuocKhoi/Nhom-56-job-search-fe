import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './editPost.module.scss';
import { getAPiNoneToken, putApiWithToken } from '../../api';
import { useParams, useNavigate } from 'react-router-dom';

const EditPost = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    category: '',
    numberOfCruiment: '',
    experienceLevel: '',
    position: '',
    address: '',
    type: '',
    expiredAt: '',
  });

  const [categoryName, setCategoryName] = useState('');
  const [categoryDa, setCategoryDa] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const data = await getAPiNoneToken(`/job/${jobId}`);
        const job = data.data.job;

        console.log(job.type);

        const categoryData = await getAPiNoneToken(`/category/${job.category}`);//sửa lại none token
        const categoryDa = await getAPiNoneToken(`/category/get-all`);//lấy tất cả
        setCategoryDa(categoryDa.data.categories);
        console.log(categoryDa.data.categories);
        
        const categoryName = categoryData.data.category.name;
        

        setJobData({
          title: job.title || '',
          description: job.description || '',
          requirements: job.requirements ? job.requirements.join(', ') : '',
          salary: job.salary || '',
          category: job.category || '', // id
          numberOfCruiment: job.numberOfCruiment || '',
          experienceLevel: job.experienceLevel || '',
          position: job.position || '',
          address: job.address || '',
          type: job.type || 'fulltime',
          expiredAt: job.expiredAt ? job.expiredAt.split('T')[0] : '', // Convert date format
        });

        setCategoryName(categoryName); //
      } catch (error) {
        setError('Failed to fetch job data');
      }
    };

    fetchJobData();
  }, [jobId]);

  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value || '',
    });
  };

  //edit job xong sửa status lại thành false chờ phê duyệt lại
  const handleEditPostJob = async () => {
    if (isEditing) {
      try {
        const updatedJob = {
          ...jobData,
          requirements: jobData.requirements.split(',').map(req => req.trim()), // Convert requirements back to array
        };

        await putApiWithToken(`/job/update/${jobId}`, updatedJob);

        navigate(`/postedDetail/${jobId}`);
      } catch (error) {
        setError('Failed to update job');
      }
    } else {
      setIsEditing(true);
    }
  };

  return (
    <div className={clsx(styles.createPostJobPage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <h2 className={clsx(styles.pageTitle)}>Sửa Tin Tuyển Dụng</h2>
        <form className={clsx(styles.form)}>
          
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="title">Tiêu đề</label>
            <input
              type="text"
              id="title"
              name="title"
              value={jobData.title}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={jobData.description}
              onChange={handleChange}
              readOnly={!isEditing}
            ></textarea>
          </div>
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="requirements">Yêu cầu</label>
            <textarea
              id="requirements"
              name="requirements"
              value={jobData.requirements}
              onChange={handleChange}
              readOnly={!isEditing}
            ></textarea>
          </div>
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="salary">Mức lương</label>
            <input
              type="number"
              id="salary"
              name="salary"
              value={jobData.salary}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="numberOfCruiment">Số lượng tuyển</label>
            <input
              type="number"
              id="numberOfCruiment"
              name="numberOfCruiment"
              value={jobData.numberOfCruiment}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="experienceLevel">Kinh nghiệm</label>
            <input
              type="text"
              id="experienceLevel"
              name="experienceLevel"
              value={jobData.experienceLevel}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="position">Vị trí</label>
            <input
              type="text"
              id="position"
              name="position"
              value={jobData.position}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="address">Địa chỉ</label>
            <input
              type="text"
              id="address"
              name="address"
              value={jobData.address}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="type">Loại công việc</label>
            <select
              id="type"
              name="type"
              value={jobData.type}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value="fulltime">Full-time</option>
              <option value="parttime">Part-time</option>
              <option value="intern">Intern</option>
            </select>
          </div>
          {/*  */}
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="category">Danh mục</label>
            <select
              id="category"
              name="category"
              value={jobData.category}
              onChange={handleChange}
              disabled={!isEditing}
            >
              <option value={jobData.category}>{categoryName}</option>
              {categoryDa.filter((category) => category._id !== jobData.category).map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="expiredAt">Ngày hết hạn</label>
            <input
              type="date"
              id="expiredAt"
              name="expiredAt"
              value={jobData.expiredAt}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
        </form>
        <div className={clsx(styles.actions)}>
          <button className={clsx(styles.createButton)} onClick={handleEditPostJob}>
            {isEditing ? 'Xác nhận chỉnh sửa' : 'Sửa bài đăng'}
          </button>
          <button className={clsx(styles.cancelButton)} onClick={() => navigate(-1)}>
            Hủy bỏ
          </button>
        </div>
        {error && <div className={clsx(styles.errorMessage)}>{error}</div>}
      </div>
      <Footer />
    </div>
  );
};

export default EditPost;
