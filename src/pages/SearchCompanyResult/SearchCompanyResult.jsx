import React, { useEffect, useState } from 'react';
import { postApiNoneToken } from '../../api';
import clsx from 'clsx';
import styles from '../SearchCompanyResult/searchCompanyResult.module.scss';
import { Link, useLocation } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import logo from '../../images/logo.png';
import { useTranslation } from 'react-i18next';
import usePageTitle from '../../hooks/usePageTitle';
import Loading from '../../components/Loading/Loading';

// const cities = [
//   'All cities','TP.HCM', 'Hà Nội', 'Đà Nẵng', // Priority cities
//   'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
//   'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
//   'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
//   'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
//   'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hòa Bình',
//   'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
//   'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An',
//   'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình',
//   'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
//   'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
//   'Thừa Thiên - Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long',
//   'Vĩnh Phúc', 'Yên Bái'
// ];

const SearchCompanyResult = () => {
  usePageTitle('Tìm công ty');

  const { t, i18n } = useTranslation();

  const cities = [
    t('search.allCities'), 'TP.HCM', 'Hà Nội', 'Đà Nẵng', // Priority cities
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

  const location = useLocation();
  const initialSearchParams = location.state?.searchParams || {};
  
  const [addressInput, setAddressInput] = useState(initialSearchParams.city || '');
  const [companyInput, setCompanyInput] = useState(initialSearchParams.search || '');
  const [results, setResults] = useState(null);

  const [error, setError] = useState(null);

  //loading spinner
  const [loading, setLoading] = useState(false);

  const handleSearch = async (event) => {
    if(event){
        event.preventDefault();//tránh tải lại trang làm mất dữ liệu đang hiển thị
    }

    const searchParams = {
        search: companyInput.trim(),
        city: addressInput.trim() || '',
    };
    
    try {
      setLoading(true);
      const response = await postApiNoneToken('/user/search', searchParams);
      setLoading(false);

      if (response.data.success) {
        // console.log(response.data.data);
        setResults(response.data.data);
      } else {
        setResults(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults(null);
    }
  };

  useEffect(()=>{
    if(Object.keys(initialSearchParams).length){
        handleSearch();
    }
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <>
      {loading ? <Loading /> : null}
      <div className={clsx(styles.searchComponent)}>
        <Header />
      <div className={clsx(styles.searchContainer)}>

      
      <form className={clsx(styles.searchBar)}>
        <div className={clsx(styles.form)}>

    <div className={clsx(styles.placeContainer)}>
      <div className={clsx(styles.iconPlace)}>
        <i className="fa-solid fa-location-dot"></i>
      </div>
      
      <div className={clsx(styles.selectContainer)}>
        <select
              className={clsx(styles.select)}
              value={addressInput}
              // onChange={(e) => setAddressInput(e.target.value)}
              onChange={(e) => {
                const selectedCity = e.target.value;
                setAddressInput(selectedCity === "All cities" ? "" : selectedCity);
              }}
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            </div>
      </div>
      
      <div className={clsx(styles.searchBtnContainer)}>
          <input
            className={clsx(styles.jobInput)}
            type="text"
            id="search"
            value={companyInput}
            onChange={(e) => setCompanyInput(e.target.value)}
            // placeholder="Enter company name, etc."
            placeholder={t('search.enterCompany')}
          />
          <button className={clsx(styles.searchButton)} onClick={handleSearch}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <span>{t('search.search')}</span>
          </button>
          </div>

        </div>
      </form>
    </div>

      {results && (
        <div className={clsx(styles.results)}>
          <div className={clsx(styles.tabContent)}>
              <div>
                <p className={clsx(styles.textTitleTab)}>{t('search.company')}</p>
                {results.companies.length > 0 ? (
                  results.companies.map((company) => (
                    <Link key={company._id} to={`/detailCompany/${company._id}`} target="_blank" rel="noopener noreferrer" className={clsx(styles.linkCompany)}>
                      <div className={clsx(styles.companycard)}>
                        <img src={company.avatar || logo} alt="Logo" className={clsx(styles.avatarCompany)}/>
                        <h3>{company.name}</h3>
                      </div>
                    </Link>
                  ))
                  ):(
                    <div className={clsx(styles.cardNoResult)}><p className={clsx(styles.textNoResult)}>{t('search.noMatch')}</p></div>
                )}
              </div>
          </div>
        </div>
      )}
      <Footer/>
    </div>
    </>
  );
};

export default SearchCompanyResult;
