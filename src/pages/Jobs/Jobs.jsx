import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './jobs.module.scss';
import ListJobInfo from '../../components/ListJobInfo/ListJobInfo';
import { Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { postApiNoneToken } from '../../api';

const cities = [
  'All cities', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', // Priority cities
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

const Jobs = () => {
  //search
  const [addressInput, setAddressInput] = useState('');
  const [jobInput, setJobInput] = useState('');
  const [results, setResults] = useState(null);

  //city
  const [showCityModal, setShowCityModal] = useState(false);
  const [filteredCities, setFilteredCities] = useState(cities);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();
  
    try {
      const searchParams = {
        search: jobInput.trim(),
        city: addressInput.trim() || '',
      };
  
      const response = await postApiNoneToken('/job/search', searchParams);

      console.log("82", searchParams);
      
      console.log("82", response.data.jobs);
  
      if (response.data.success) {
        setResults(response.data.jobs);
      } else {
        setResults(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults(null);
    }
  };

   //city
   const handleCityInputClick = () => {
    setShowCityModal(true);
  };

  const handleCitySelect = (city) => {
    if(city === 'All cities'){
      setAddressInput(city);
    } else {
      setAddressInput(city);
    }
    setShowCityModal(false);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredCities(cities.filter(city => city.toLowerCase().includes(query)));
  };

  return (
    <div className={clsx(styles.homePage)}>
      <Header />
      <main className={clsx(styles.mainContent)}>
          <span>List Jobs</span>
          {/* search bar */}
          <div className={clsx(styles.searchBar)}>
          <div className={clsx(styles.form)}>

          <div className={clsx(styles.iconPlace)}>
            <i className="fa-solid fa-location-dot"></i>
          </div>
          
          <div className={clsx(styles.selectContainer)}>
            <select
                  className={clsx(styles.select)}
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
          </div>

            <input
              type="text"
              placeholder="Enter job title"
              className={clsx(styles.jobInput)}
              id="search"
              value={jobInput}
              onChange={(e) => setJobInput(e.target.value)}
            />
            <button 
              variant="primary" 
              className={clsx(styles.searchButton)} 
              onClick={handleSearch}
            >
          <i className="fa-solid fa-magnifying-glass"></i>
              Search
            </button>
          </div>
        </div>

        {results && (
        <div>
          {results
            .filter((job) => job.status === true)
            .map((job) => (
            <Link key={job._id} to={`/detailJob/${job._id}`}>
              <li>{job.title}</li>
            </Link>
          ))}
        </div>
      )}
          <ListJobInfo />
      </main>
      <Footer />
    </div>
  );
};

export default Jobs;
