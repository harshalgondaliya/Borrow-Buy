import https from 'https';

https.get({
  hostname: 'api.github.com',
  path: '/repos/harshalgondaliya/Borrow-Buy/commits/c0e2294/check-runs',
  headers: { 'User-Agent': 'NodeJS-Agent' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const obj = JSON.parse(data);
      console.log('Total check runs:', obj.total_count);
      if (obj.check_runs) {
        for (const r of obj.check_runs) {
          console.log(`- ${r.name}: ${r.status} (${r.conclusion || 'pending'})`);
        }
      }
    } catch (e) {
      console.error(e.message, data.slice(0, 200));
    }
  });
});
