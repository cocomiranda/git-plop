// dummydata.js
// Run this in the browser console to generate and print a poopData object
(function() {
  const today = new Date();
  const year = today.getFullYear();
  const poopData = {};

  // Add last 3 days including today
  for (let i = 0; i < 3; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);
    poopData[d.toISOString().slice(0, 10)] = true;
  }

  // Helper to get a random date in the year
  function randomDateInYear() {
    const start = new Date(year, 0, 1).getTime();
    const end = new Date(year, 11, 31).getTime();
    const date = new Date(start + Math.random() * (end - start));
    date.setHours(0, 0, 0, 0);
    return date.toISOString().slice(0, 10);
  }

  // Add 10 unique random dates
  let count = 0;
  while (count < 10) {
    const dateStr = randomDateInYear();
    if (!poopData[dateStr]) {
      poopData[dateStr] = true;
      count++;
    }
  }

  console.log('Copy and paste this into localStorage:');
  console.log('localStorage.setItem("poopData", ' + JSON.stringify(JSON.stringify(poopData)) + ')');
  console.log(poopData);
})(); 