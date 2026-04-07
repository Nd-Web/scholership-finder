const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...\n');
  console.log('URL:', supabaseUrl);

  // Test 1: Check if we can reach Supabase
  console.log('\n1. Testing basic connectivity...');
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

  if (userError) {
    console.error('   ERROR:', userError.message);
    return;
  }
  console.log('   SUCCESS: Connected to Supabase');
  console.log('   Total users:', userData.users.length);

  // Test 2: Check if profiles table exists
  console.log('\n2. Checking profiles table...');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (profilesError) {
    console.error('   ERROR:', profilesError.message);
    console.log('   ACTION: Run the supabase-schema.sql in your Supabase SQL Editor');
  } else {
    console.log('   SUCCESS: profiles table exists');
    console.log('   Profile count:', profiles.length);
  }

  // Test 3: Check if scholarships table exists
  console.log('\n3. Checking scholarships table...');
  const { data: scholarships, error: scholarshipsError } = await supabase
    .from('scholarships')
    .select('*')
    .limit(1);

  if (scholarshipsError) {
    console.error('   ERROR:', scholarshipsError.message);
    console.log('   ACTION: Run the supabase-schema.sql in your Supabase SQL Editor');
  } else {
    console.log('   SUCCESS: scholarships table exists');
    const { count } = await supabase.from('scholarships').select('*', { count: 'exact', head: true });
    console.log('   Scholarship count:', count);
  }

  // Test 4: Check if applications table exists
  console.log('\n4. Checking applications table...');
  const { data: applications, error: applicationsError } = await supabase
    .from('applications')
    .select('*')
    .limit(1);

  if (applicationsError) {
    console.error('   ERROR:', applicationsError.message);
    console.log('   ACTION: Run the supabase-schema.sql in your Supabase SQL Editor');
  } else {
    console.log('   SUCCESS: applications table exists');
  }

  console.log('\n--- Connection test complete ---\n');
}

testConnection().catch(console.error);
