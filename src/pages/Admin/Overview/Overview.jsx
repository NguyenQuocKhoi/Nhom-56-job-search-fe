import React, { useCallback, useEffect, useState } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { getAPiNoneToken, getApiWithToken } from '../../../api';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);

// Đăng ký các thành phần cần thiết cho biểu đồ
ChartJS.register(
  CategoryScale, // Đo danh mục trục x
  LinearScale,   // Đo danh mục trục y
  PointElement,  // Điểm cho biểu đồ đường
  LineElement,   // Phần tử đường cho biểu đồ đường
  BarElement,    // Phần tử cột cho biểu đồ cột
  ArcElement,    // Để vẽ biểu đồ tròn (Pie, Doughnut)
  Title,
  Tooltip,
  Legend
);

const Overview = () => {
  // Dữ liệu cho biểu đồ đường
  const lineData = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
    datasets: [
      {
        label: 'Tăng trưởng ứng viên',
        data: [50, 70, 100, 30, 180, 220],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true, // Làm đầy dưới đường
      },
      {
        label: 'Số lượng công ty',
        data: [30, 50, 10, 120, 170, 60],
        borderColor: 'rgba(255, 99, 132, 1)', // Màu đường thứ hai
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
      {
        label: 'Số lượng ứng viên',
        data: [80, 120, 160, 100, 300, 170],
        borderColor: 'rgba(154, 162, 235, 1)', // Màu đường thứ ba
        backgroundColor: 'rgba(154, 162, 235, 0.2)',
        fill: true,
      },
    ],
  };

  // Dữ liệu cho biểu đồ cột
  // const barData = {
  //   labels: ['Việc làm', 'Công ty', 'Ứng viên'],
  //   datasets: [
  //     {
  //       label: 'Số lượng',
  //       data: [150, 45, 200],
  //       backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(75, 192, 192, 0.5)'],
  //     },
  //   ],
  // };

  // Dữ liệu cho biểu đồ tròn
  // const pieDataJobs = {
  //   labels: ['Việc làm đã đăng', 'Việc làm đã duyệt', 'Việc làm bị từ chối', 'Việc đang chờ phê duyệt'],
  //   datasets: [
  //     {
  //       data: [100, 30, 20, 25],
  //       backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)', 'rgba(200, 99, 123, 0.5)'],
  //     },
  //   ],
  // };

  // const pieDataCompanies = {
  //   labels: ['Công ty đã đăng ký', 'Công ty được duyệt', 'Công ty bị từ chối'],
  //   datasets: [
  //     {
  //       data: [60, 25, 15],
  //       backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
  //     },
  //   ],
  // };

  // const pieDataCandidates = {
  //   labels: ['Ứng viên đã đăng ký', 'Ứng viên được duyệt', 'Ứng viên bị từ chối'],
  //   datasets: [
  //     {
  //       data: [180, 15, 5],
  //       backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
  //     },
  //   ],
  // };

  // Dữ liệu cho biểu đồ doughnut
  // const doughnutData1 = {
  //   labels: ['Việc làm', 'Công ty', 'Ứng viên'],
  //   datasets: [
  //     {
  //       label: 'Doughnut 1',
  //       data: [150, 45, 200],
  //       backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(75, 192, 192, 0.5)'],
  //     },
  //   ],
  // };

  // const doughnutData2 = {
  //   labels: ['Hoạt động', 'Ngưng hoạt động'],
  //   datasets: [
  //     {
  //       label: 'Doughnut 2',
  //       data: [70, 30],
  //       backgroundColor: ['rgba(255, 205, 86, 0.5)', 'rgba(255, 99, 132, 0.5)'],
  //     },
  //   ],
  // };

  // const doughnutData3 = {
  //   labels: ['Nam', 'Nữ', 'Khác'],
  //   datasets: [
  //     {
  //       label: 'Doughnut 3',
  //       data: [50, 40, 10],
  //       backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)', 'rgba(255, 205, 86, 0.5)'],
  //     },
  //   ],
  // };

  // const options = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: 'top',
  //     },
  //     title: {
  //       display: true,
  //       text: 'Thống kê tổng quan',
  //       font: {
  //         size: 20,
  //       }
  //     },
  //   },
  // };

  const options = {
    plugins: {
      datalabels: {
        color: '#666', // Màu chữ
        formatter: (value, context) => {
          return value; // Hiển thị giá trị
        },
        font: {
          weight: 'bold', // Định dạng chữ
          size: 16, // Kích thước chữ
        },
        anchor: 'center', // Vị trí
        align: 'center', // Căn lề
        formatter: (value, context) => {
          return value === 0 ? '' : value;
        }
      },
    },
    tooltips: {
      enabled: false,
    }
  };  

  const [companiesData, setCompaniesData] = useState({ accepted: 0, rejected: 0, pending: 0, total: 0 });
  const [jobsData, setJobsData] = useState({ accepted: 0, rejected: 0, pending: 0, total: 0 });
  const [candidatesData, setCandidatesData] = useState({ male: 0, female: 0, other: 0, total: 0 });
  
  const fetchCompanies = useCallback(async () => {
    try {
      const result = await getAPiNoneToken('/company/get-all');
      const companies = result.data.companies;

      const companiesAccepted = companies.filter(company => company.status === true && company.pendingUpdates === null).length;
      const companiesRejected = companies.filter(company => company.status === false && company.pendingUpdates === null).length;
      const companiesPending = companies.filter(company => company.status === undefined || company.pendingUpdates !== null).length;

      setCompaniesData({
        accepted: companiesAccepted,
        rejected: companiesRejected,
        pending: companiesPending,
        total: companies.length
      });
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const result = await getAPiNoneToken('/job/get-all');
      const jobs = result.data.jobs;

      const jobsAccepted = jobs.filter(job => job.status === true && job.pendingUpdates === null).length;
      const jobsRejected = jobs.filter(job => job.status === false && job.pendingUpdates === null).length;
      const jobsPending = jobs.filter(job => job.pendingUpdates !== null || job.status === undefined).length;

      setJobsData({
        accepted: jobsAccepted,
        rejected: jobsRejected,
        pending: jobsPending,
        total: jobs.length
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }, []);

  const fetchCandidates = useCallback(async () => {
    try {
      const result = await getApiWithToken('/candidate/get-all');
      const candidates = result.data.candidates;

      const male = candidates.filter(candidate => candidate.gender === 'male').length;
      const female = candidates.filter(candidate => candidate.gender === 'female').length;
      const other = candidates.filter(candidate => candidate.gender === 'Other').length;

      setCandidatesData({
        male,
        female,
        other,
        total: candidates.length
      });
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
    fetchJobs();
    fetchCandidates();
  }, [fetchCompanies, fetchJobs, fetchCandidates]);

  // Biểu đồ cột cho tổng số lượng công ty, ứng viên, và việc làm
  const barData = {
    labels: ['Công ty', 'Ứng viên', 'Việc làm'],
    datasets: [
      {
        label: 'Số lượng',
        data: [companiesData.total, candidatesData.total, jobsData.total],
        backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 159, 64, 0.5)', 'rgba(54, 162, 235, 0.5)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 159, 64, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Biểu đồ tròn cho phân loại công ty
  const companyPieData = {
    labels: ['Accepted', 'Rejected', 'Pending'],
    datasets: [
      {
        data: [companiesData.accepted, companiesData.rejected, companiesData.pending],
        backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)', 'rgba(255, 206, 86, 0.5)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Biểu đồ tròn cho phân loại việc làm
  const jobPieData = {
    labels: ['Accepted', 'Rejected', 'Pending'],
    datasets: [
      {
        data: [jobsData.accepted, jobsData.rejected, jobsData.pending],
        backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)', 'rgba(255, 159, 64, 0.5)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
        borderWidth: 1,
      },
    ],
  };

  // Biểu đồ tròn cho giới tính ứng viên
  const candidatePieData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        data: [candidatesData.male, candidatesData.female, candidatesData.other],
        backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)', 'rgba(255, 206, 86, 0.5)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      {/* <h2>Thống kê tổng quan</h2> */}
      
      {/* Biểu đồ đường */}
      {/* <div style={{maxWidth: '1000px', margin: '0 auto'}}>
        <Line data={lineData} 
          options={options} 
        />
      </div> */}

      <h3>Thống kê tổng quan</h3>
      <div style={{maxWidth: '1000px', margin: '0 auto'}}>
        <Bar data={barData} options={options}/>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px' }}>
        <div style={{ width: '30%', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
          <Pie data={companyPieData} options={options} />
          <p>Công ty</p>
        </div>

        <div style={{ width: '30%', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
          <Pie data={jobPieData} options={options} />
          <p>Công việc</p>
        </div>

        <div style={{ width: '30%', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
          <Pie data={candidatePieData} options={options} />
          <p>Ứng viên</p>
        </div>
      </div>

      {/* Biểu đồ cột */}
      {/* <div style={{maxWidth: '1000px', margin: '0 auto'}}>
        <Bar data={barData} 
          options={options} 
        /> */}
        {/* <h3>Thống kê tổng quan</h3> */}
      {/* </div> */}

      {/* Ba biểu đồ tròn */}
      {/* <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px' }}>
        <div style={{ width: '30%' }}>
          <h3>Thống kê việc làm</h3>
          <Pie data={pieDataJobs} />
        </div>
        <div style={{ width: '30%' }}>
          <h3>Thống kê công ty</h3>
          <Pie data={pieDataCompanies} />
        </div>
        <div style={{ width: '30%' }}>
          <h3>Thống kê ứng viên</h3>
          <Pie data={pieDataCandidates} />
        </div>
      </div> */}

      {/* <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '40px' }}>
        <div style={{ width: '30%' }}>
          <h3>Thống kê việc làm</h3>
          <Doughnut data={doughnutData1} 
            // options={options} 
          />
        </div>
        <div style={{ width: '30%' }}>
          <h3>Thống kê công ty</h3>
          <Doughnut data={doughnutData2} 
            // options={options} 
          />
        </div>
        <div style={{ width: '30%' }}>
          <h3>Thống kê ứng viên</h3>
          <Doughnut data={doughnutData3} 
            // options={options} 
          />
        </div>
      </div> */}
    </div>
  );
};

export default Overview;
