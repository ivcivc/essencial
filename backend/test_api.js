const http = require('http');

const data = JSON.stringify({
  email: 'admin@clinicaessencial.com',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 3334,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('Request finished');
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(data);
req.end(); 