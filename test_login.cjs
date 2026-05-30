const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5175/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => {
    console.log('Raw response status:', response.status);
    console.log('Raw response data:', JSON.stringify(response.data, null, 2));
    return response.data;
  },
  (error) => {
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', JSON.stringify(error.response?.data, null, 2));
    return Promise.reject(error);
  }
);

async function testLogin() {
  try {
    const res = await api.post('/auth/login', { username: 'admin', password: '123456' });
    console.log('\nIntercepted result:', JSON.stringify(res, null, 2));
    console.log('res.code:', res.code);
    console.log('res.code === 200:', res.code === 200);
  } catch (err) {
    console.error('Login failed:', err.message);
  }
}

testLogin();
