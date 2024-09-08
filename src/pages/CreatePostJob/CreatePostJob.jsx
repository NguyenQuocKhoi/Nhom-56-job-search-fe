import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './createPostJob.module.scss';
import { postApiWithToken } from '../../api';
import { getUserStorage } from '../../Utils/valid';

const CreatePostJob = () => {
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    numberOfCruiment: '',
    experienceLevel: '',
    position: '',
    address: '',
    type: 'fulltime', // default to 'fulltime'
    expiredAt: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreatePostJob = async () => {
    const userData = getUserStorage()?.user;

    // Check if all required fields are filled
    const {
      title,
      description,
      requirements,
      salary,
      numberOfCruiment,
      category,
      experienceLevel,
      position,
      address,
      type,
      expiredAt,
    } = jobData;

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !numberOfCruiment||
      !category||
      !experienceLevel ||
      !position ||
      !address ||
      !type ||
      !expiredAt
    ) {
      setError('Vui lòng nhập đủ thông tin');
      return;
    }

    try {
      const result = await postApiWithToken('/job/create', {
        ...jobData,
        companyId: userData._id, // Lấy ID của tài khoản hiện tại
        status: 'pending',
      });

      if (result.data.success) {
        setError('');
      } else {
        setError(result.data.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error(err);
      setError('Có lỗi xảy ra khi tạo bài đăng');
    }
  };

  return (
    <div className={clsx(styles.createPostJobPage)}>
      <Header />
      <div className={clsx(styles.mainContent)}>
        <h2 className={clsx(styles.pageTitle)}>Tạo Tin Tuyển Dụng</h2>
        <form className={clsx(styles.form)}>
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="title">Tiêu đề</label>
            <input
              type="text"
              id="title"
              name="title"
              value={jobData.title}
              onChange={handleChange}
            />
          </div>
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={jobData.description}
              onChange={handleChange}
            ></textarea>
          </div>
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="requirements">Yêu cầu</label>
            <textarea
              id="requirements"
              name="requirements"
              value={jobData.requirements}
              onChange={handleChange}
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
            />
          </div>
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="type">Loại công việc</label>
            <select
              id="type"
              name="type"
              value={jobData.type}
              onChange={handleChange}
            >
              <option value="fulltime">Full-time</option>
              <option value="parttime">Part-time</option>
              <option value="intern">Intern</option>
            </select>
          </div>
          {/* chưa lấy được category từ dbs ra, để tạm vầy */}
          <div className={clsx(styles.formGroup)}>
            <label htmlFor="category">Danh mục</label>
            <select
              id="category"
              name="category"
              value={jobData.category}//
              onChange={handleChange}
            >
              <option value="frontend">Front-end</option>
              <option value="backend">Back-end</option>
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
            />
          </div>
        </form>
        <div className={clsx(styles.actions)}>
          <button
            className={clsx(styles.createButton)}
            onClick={handleCreatePostJob}
          >
            Tạo bài đăng
          </button>
          <button
            className={clsx(styles.cancelButton)}
            onClick={handleCreatePostJob}
          >
            Hủy
          </button>
        </div>
        {error && <div className={clsx(styles.errorMessage)}>{error}</div>}
      </div>
      <Footer />
    </div>
  );
};

export default CreatePostJob;
