async function test() {
  // Frontend renders
  const html = await fetch('http://localhost:3000/').then(r => r.text());
  console.log('Title:', html.includes('MotionU') ? 'OK' : 'FAIL');
  console.log('Has generator:', html.includes('Issue a new route') ? 'OK' : 'FAIL');
  console.log('Has route-line:', html.includes('ORIGIN') ? 'OK' : 'FAIL');
  
  // API: create a link
  const post = await fetch('http://localhost:3000/api/v1/link-shorterner/links/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ destination_url: 'https://example.com', slug: 'test' })
  });
  const link = await post.json();
  console.log('POST /links/', post.status, 'slug:', link.slug);
  
  // Top-level /[slug] redirect
  const redir = await fetch('http://localhost:3000/test', { redirect: 'manual' });
  console.log('GET /test:', redir.status, '->', redir.headers.get('location'));
  
  // API redirect (backward compat)
  const redir2 = await fetch('http://localhost:3000/api/v1/link-shorterner/r/test', { redirect: 'manual' });
  console.log('GET /r/test:', redir2.status, '->', redir2.headers.get('location'));
  
  console.log('\\nAll tests done!');
}
test().catch(e => console.log('Error:', e.message));
