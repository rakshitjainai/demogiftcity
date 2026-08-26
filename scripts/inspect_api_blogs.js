(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/blogs');
    const data = await res.json();
    console.log('ok:', data.ok);
    console.log('count:', data.count);
    console.log('posts length:', data.posts?.length);
    console.log('First 10 posts:');
    (data.posts || []).slice(0, 10).forEach((p, i) => {
      console.log(`  [${i + 1}] slug: ${p.slug} | title: "${p.title}" | isDynamic: ${p.isDynamic} | content preview: "${(p.content || '').replace(/<[^>]+>/g, '').slice(0, 50)}"`);
    });
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
})();
