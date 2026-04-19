const http = require('http');

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(data || '{}') }));
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

async function runTests() {
  await new Promise(resolve => setTimeout(resolve, 2000)); // wait for server to start
  console.log("Starting tests...");
  let userToken;

  try {
    // 1. Test Auth Register
    const regData = JSON.stringify({ name: 'TestUser2', email: 'test2@example.com', password: 'password123', role: 'seller', phone: '123456789' });
    const regRes = await request({ hostname: '127.0.0.1', port: 9429, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } }, regData);
    console.log('Register:', regRes.data);
    userToken = regRes.data.token;

    // 2. Test Auth Login
    const loginData = JSON.stringify({ email: 'test2@example.com', password: 'password123' });
    const loginRes = await request({ hostname: '127.0.0.1', port: 9429, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } }, loginData);
    console.log('Login:', loginRes.data);
    if (!userToken) userToken = loginRes.data.token;

    // 3. Test Property Input
    const propData = JSON.stringify({
      title: 'Beautiful Villa 2', price: 600000, location: '123 Fake St', type: 'Villa', bedrooms: 4, image: 'img.png', sellerName: 'TestUser2', sellerEmail: 'test2@example.com'
    });
    const propRes = await request({ hostname: '127.0.0.1', port: 9429, path: '/api/properties/input', method: 'POST', headers: { 'Content-Type': 'application/json' } }, propData);
    console.log('Property Add:', propRes.data);

    // 4. Test Property Filter
    const filterData = JSON.stringify({ type: 'Villa' });
    const filterRes = await request({ hostname: '127.0.0.1', port: 9429, path: '/api/properties/filter', method: 'POST', headers: { 'Content-Type': 'application/json' } }, filterData);
    console.log('Property Filter:', filterRes.data);
    const propId = filterRes.data.properties?.[0]?._id;

    if (propId) {
      // 5. Test Send Buy Request
      const reqData = JSON.stringify({ propertyId: propId, buyerName: 'BuyerDude2', buyerEmail: 'buyer2@example.com', buyerPhone: '987654321', message: 'I want to buy!' });
      const buyRes = await request({ hostname: '127.0.0.1', port: 9429, path: '/api/requests/buy', method: 'POST', headers: { 'Content-Type': 'application/json' } }, reqData);
      console.log('Buy Request:', buyRes.data);
      const reqId = buyRes.data.request?._id;

      if (reqId) {
        // 6. Test Accept Request
        const acceptRes = await request({ hostname: '127.0.0.1', port: 9429, path: `/api/requests/${reqId}/accept`, method: 'PUT', headers: { 'Content-Type': 'application/json' } });
        console.log('Accept Request:', acceptRes.data);
      }
    }

    // 7. Test Save Filters
    const userId = loginRes.data?.data?.id || regRes.data?.data?.id;
    const notData = JSON.stringify({ User: userId, location: 'Dhaka', type: 'Apartment', bedrooms: 3, min_price: 1000, max_price: 5000 });
    const notRes = await request({ hostname: '127.0.0.1', port: 9429, path: '/api/properties/savefilters', method: 'POST', headers: { 'Content-Type': 'application/json' } }, notData);
    console.log('Save Filters:', notRes.data);

  } catch (err) {
    console.error(err);
  }
}

runTests();
