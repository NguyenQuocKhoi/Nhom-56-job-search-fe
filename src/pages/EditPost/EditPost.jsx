import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './editPost.module.scss';
import { getAPiNoneToken, getApiWithToken, putApiWithToken } from '../../api';
import { useParams, useNavigate } from 'react-router-dom';

const cities = [
  'TP.HCM', 'Hà Nội', 'Đà Nẵng', // Priority cities
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An',
  'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình',
  'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
  'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
  'Thừa Thiên - Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long',
  'Vĩnh Phúc', 'Yên Bái'
];

const EditPost = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    interest: '',
    requiremenSkills: [],
    salary: '',
    category: '',
    numberOfCruiment: '',
    experienceLevel: '',
    position: '',
    city: '',
    street: '',
    type: '',
    expiredAt: '',
  });

  const [categoryName, setCategoryName] = useState('');
  const [categoryDa, setCategoryDa] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  //skill
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showSkillModal, setShowSkillModal] = useState(false);
  //city
  const [showCityModal, setShowCityModal] = useState(false);
  const [filteredCities, setFilteredCities] = useState(cities);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        const data = await getAPiNoneToken(`/job/${jobId}`);
        const job = data.data.job;

        console.log(job.requirementSkills);

        const categoryData = await getAPiNoneToken(`/category/${job.category}`);
        const categoryDa = await getAPiNoneToken(`/category/get-all`);
        setCategoryDa(categoryDa.data.categories);
        // console.log(categoryDa.data.categories);
        
        const categoryName = categoryData.data.category.name;
        
        //skill
        const skillPromises = job.requirementSkills.map(skillId => 
          getAPiNoneToken(`/skill/${skillId}`)
        );
        
        const skillResponses = await Promise.all(skillPromises);
        const skillNames = skillResponses.map(res => res.data.skill.skillName);
        setSkills(skillNames);
        setSelectedSkills(job.requirementSkills);

        setJobData({
          title: job.title || '',
          description: job.description || '',
          requirements: job.requirements || '',
          interest: job.interest || '',
          requirementSkills: job.requirementSkills,
          salary: job.salary || '',
          category: job.category || '', // id
          numberOfCruiment: job.numberOfCruiment || '',
          experienceLevel: job.experienceLevel || '',
          position: job.position || '',
          city: job.city || '',
          street: job.street || '',
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
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   const newValue = Math.max(1, Number(value)); // Ensure value is at least 1
  //   setJobData((prevData) => ({
  //     ...prevData,
  //     [name]: newValue,
  //   }));
  // };

  //edit job xong sửa status lại thành false chờ phê duyệt lại
  const handleEditPostJob = async () => {
    if (isEditing) {
      try {
        const updatedJob = {
          ...jobData,
          requirementSkills: selectedSkills,
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

  const fetchAllSkills = async () => {
    try {
      const response = await getApiWithToken(`/skill/get-all`);
      if (response.data.success) {
        setAllSkills(response.data.skills);
      } else {
        setError('Failed to fetch skills');
      }
    } catch (err) {
      setError('Error fetching skills');
    }
  };

  const handleOpenSkillModal = () => {
    fetchAllSkills(); // Fetch skills when opening modal
    setShowSkillModal(true);
  };

  // Close skill modal
  const handleCloseSkillModal = () => {
    setShowSkillModal(false);
  };

  const handleSkillToggle = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      // If skill is already selected, remove it from the list
      setSelectedSkills(selectedSkills.filter((id) => id !== skillId));
    } else {
      // If skill is not selected, add it to the list
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  //city
  const handleCityInputClick = () => {
    setShowCityModal(true);
  };

  const handleCitySelect = (city) => {
    setJobData({ ...jobData, city });
    setShowCityModal(false);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredCities(cities.filter(city => city.toLowerCase().includes(query)));
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
            <label htmlFor="interest">Phúc lợi</label>
            <textarea
              id="interest"
              name="interest"
              value={jobData.interest}
              onChange={handleChange}
              readOnly={!isEditing}
            ></textarea>
          </div>
          <label>Requirements skills:</label>
          <div className={clsx(styles.skillSection)}>
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <ul key={index}>
                  <li>
                  <span className={clsx(styles.skillTag)}>{skill}</span>
                  </li>
                </ul>
              ))
            ) : (
              <p>No requirements skills added</p>
            )}
          </div>
          <button 
            onClick={handleOpenSkillModal} 
            // disabled={!isEditing} // Disable button if not editing
          >
            Chọn kỹ năng
          </button>
          
          {showSkillModal && (
            <div className={clsx(styles.modal)}>
              <div className={clsx(styles.modalContent)}>
                <ul>
                  {allSkills.map((skill) => (
                    <li key={skill._id}>
                      <label>
                        <input 
                          type="checkbox" 
                          // name="skills" 
                          // value={skill._id}
                          checked={selectedSkills.includes(skill._id)}//skill có sẵn 
                          onChange={() => handleSkillToggle(skill._id)}
                        />
                        {skill.skillName}
                      </label>
                    </li>
                  ))}
                </ul>
                <button onClick={handleCloseSkillModal}>Close</button>
              </div>
            </div>
          )}

          <div className={clsx(styles.formGroup)}>
            <label htmlFor="salary">Mức lương</label>
            <input
              type="text"
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
              onInput={(e) => {
                if (e.target.value < 0) {
                  e.target.value = 1;
                }
              }}
              min="1"
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
          <label>City:</label>
        <input 
          type="text" 
          name="city"
          value={jobData.city || ""}
          onClick={handleCityInputClick}
          readOnly
          disabled={!isEditing}
        />
        {/* City Modal */}
        {showCityModal && (
          <div className={clsx(styles.modal)}>
            <div className={clsx(styles.modalContent)}>
              <input 
                type="text"
                placeholder="Search Cities..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <ul>
                {filteredCities.map((city) => (
                  <li 
                    key={city}
                    onClick={() => handleCitySelect(city)}
                  >
                    {city}
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowCityModal(false)}>Close</button>
            </div>
          </div>
        )}

          <div className={clsx(styles.formGroup)}>
            <label htmlFor="street">Đường</label>
            <input
              type="text"
              id="street"
              name="street"
              value={jobData.street}
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
