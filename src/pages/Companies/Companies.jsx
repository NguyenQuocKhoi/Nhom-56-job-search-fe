import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import clsx from 'clsx';
import styles from './companies.module.scss';
import CardCompanyInfo from '../../components/ListCompanyInfo/ListCompanyInfo';
import { Button, Form } from 'react-bootstrap';
import { postApiNoneToken } from '../../api';
import { Link } from 'react-router-dom';

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

const Companies = () => {
  //search
  const [addressInput, setAddressInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [results, setResults] = useState(null);

  //city
  const [showCityModal, setShowCityModal] = useState(false);
  const [filteredCities, setFilteredCities] = useState(cities);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();
  
    try {
      const searchParams = {
        search: companyInput.trim(),
        city: addressInput.trim() || '',
      };
  
      const response = await postApiNoneToken('/company/search', searchParams);

      console.log("70", searchParams);
      
      console.log("72", response.data.companies);
  
      if (response.data.success) {
        setResults(response.data.companies);
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
        {/* <span>List Companies</span> */}
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

            <Form.Control
              type="text"
              placeholder="Enter job title"
              className={clsx(styles.jobInput)}
              id="search"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
            />
            <Button 
              variant="primary" 
              className={clsx(styles.searchButton)} 
              onClick={handleSearch}
            >
          <i className="fa-solid fa-magnifying-glass"></i>
              Search
            </Button>
          </div>
        </div>
        {results && (
        <div>
          {results
            .filter((company) => company.status === true)
            .map((company) => (
            <Link key={company._id} to={`/detailCompany/${company._id}`}>
              <li>{company.name}</li>
            </Link>
          ))}
        </div>
      )}
        <CardCompanyInfo />
      </main>
      <Footer />
    </div>
  );
};

export default Companies;
