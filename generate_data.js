const fs = require('fs');

// Read existing db.json
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

// Get the max user ID to start from
const maxUserId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) : 0;

// Generate 10000 random users
const users = [];
for (let i = 1; i <= 10000; i++) {
  const id = maxUserId + i;
  const username = `User${id}`;
  const randomNum = Math.floor(Math.random() * 10000);
  users.push({
    id: id,
    username: username + randomNum,
    name: `User Name ${id}`,
    email: `user${id}@example.com`,
    father_name: `Father ${id}`,
    mother_name: `Mother ${id}`,
    nid: `${Math.floor(Math.random() * 10000000000000)}`,
    address: `Address ${id}`,
    role: "user",
    phone: `01${Math.floor(Math.random() * 9000000000 + 1000000000)}`
  });
}

// Generate 100000 random deposits
const deposits = [];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const payTos = ["cashier", "conviener", "prisedent"];
const methods = ["Bkash", "Nogod", "Cash"];
const types = ["Monthly", "Yearly", "Cost"];
const amounts = [200, 250];
const sessions = [2020, 2021, 2022, 2023, 2024];

// Track deposits per member per session to ensure no repeat months and max 1200
const memberSessionTracker = {};

let depositId = db.deposits.length > 0 ? Math.max(...db.deposits.map(d => d.id)) + 1 : 1;

for (let i = 0; i < 100000; i++) {
  const memberCode = Math.floor(Math.random() * 10000) + maxUserId + 1; // Random from generated users
  const session = sessions[Math.floor(Math.random() * sessions.length)];
  const key = `${memberCode}-${session}`;
  
  // Get used months for this member-session combination
  if (!memberSessionTracker[key]) {
    memberSessionTracker[key] = [];
  }
  
  // Try to find an unused month, if all 12 months used, skip this deposit
  const availableMonths = months.filter(m => !memberSessionTracker[key].includes(m));
  if (availableMonths.length === 0) {
    continue;
  }
  
  const month = availableMonths[Math.floor(Math.random() * availableMonths.length)];
  memberSessionTracker[key].push(month);
  
  // Calculate total amount for this member-session so far
  const existingAmounts = memberSessionTracker[`${key}-amounts`] || [];
  let amount = amounts[Math.floor(Math.random() * amounts.length)];
  
  // Ensure yearly max doesn't exceed 1200
  const currentTotal = existingAmounts.reduce((a, b) => a + b, 0);
  if (currentTotal + amount > 1200) {
    amount = 1200 - currentTotal;
    if (amount <= 0) continue;
  }
  
  if (!memberSessionTracker[`${key}-amounts`]) {
    memberSessionTracker[`${key}-amounts`] = [];
  }
  memberSessionTracker[`${key}-amounts`].push(amount);
  
  const method = methods[Math.floor(Math.random() * methods.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const payTo = payTos[Math.floor(Math.random() * payTos.length)];
  
  // Generate random date within the session year
  const year = session;
  const monthIndex = months.indexOf(month);
  const day = Math.floor(Math.random() * 28) + 1;
  const date = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  const deposit = {
    id: depositId++,
    member_code: memberCode,
    amount: amount,
    type: type,
    session: session,
    month: month,
    method: method,
    pay_to: payTo,
    send_number: method === "Cash" ? null : `01${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    receive_number: method === "Cash" ? null : `01${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    date: date,
    trx_id: method === "Cash" ? null : `TX${Math.floor(Math.random() * 1000000)}`,
    created_at: new Date(date).toISOString()
  };
  
  deposits.push(deposit);
}

// Update db.json with new users and deposits
db.users = [...db.users, ...users];
db.deposits = [...db.deposits, ...deposits];

// Write back to db.json
fs.writeFileSync('db.json', JSON.stringify(db, null, 2));

console.log(`Generated ${users.length} users and ${deposits.length} deposits`);
