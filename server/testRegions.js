const { Client } = require('pg');

const regions = ['ap-south-1', 'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ap-southeast-1', 'ap-northeast-1', 'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3'];
let found = false;

async function testRegions() {
  for (const region of regions) {
    const connStr = `postgresql://postgres.eftbckcaewmnkikjzuhr:Adharsh%407981@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 3000 });
    try {
      await client.connect();
      console.log('SUCCESS with region:', region);
      console.log('Connection string:', connStr);
      await client.end();
      found = true;
      break;
    } catch (e) {
      console.log('Failed:', region, e.message);
    }
  }
  if (!found) console.log('None worked');
}
testRegions();
