const axios = require('axios');

async function testLogin(iteration) {
  try {
    const res = await axios.post('http://localhost:3002/api/auth/login', {
      username: 'admin',
      password: '123456'
    });
    console.log(`Login ${iteration}: SUCCESS - code=${res.data.code}`);
    return true;
  } catch (err) {
    console.log(`Login ${iteration}: FAILED - ${err.response?.status} ${JSON.stringify(err.response?.data)}`);
    return false;
  }
}

async function runTests() {
  console.log('Testing 5 consecutive logins...\n');
  let success = 0;
  let failed = 0;

  for (let i = 1; i <= 5; i++) {
    const result = await testLogin(i);
    if (result) success++;
    else failed++;
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\nResults: ${success} success, ${failed} failed`);
}

runTests();
