const bcrypt = require('bcryptjs');

const dbHash = '$2a$10$G6RaJqIoeqGEr1UeVcCm0uADx8FHCTah1XKHrmzy6XHrdjkOTv8US';
console.log('DB Hash:', dbHash);
console.log('Verify 123456:', bcrypt.compareSync('123456', dbHash));
console.log('Verify admin:', bcrypt.compareSync('admin', dbHash));

const newHash = bcrypt.hashSync('123456', 10);
console.log('\nNew hash for 123456:', newHash);
console.log('Verify new hash:', bcrypt.compareSync('123456', newHash));
