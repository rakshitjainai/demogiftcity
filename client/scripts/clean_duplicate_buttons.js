import fs from 'fs';

function cleanDuplicateButtons(filePath) {
  const posts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let count = 0;
  posts.forEach(p => {
    if (p.content) {
      const before = p.content;
      p.content = p.content.replace(/<p><a href="\/learn\/sebi-aif" class="btn btn-warning">Start AIF Masterclass →<\/a><\/p>/gi, '');
      p.content = p.content.replace(/<p><a href="\/learn\/ifsca-cmi" class="btn btn-warning">Start Interactive Course →<\/a><\/p>/gi, '');
      p.content = p.content.replace(/<p><a href="\/tools\/compliance-calendar" class="btn btn-warning">Open Compliance Calendar →<\/a><\/p>/gi, '');
      if (p.content !== before) count++;
    }
  });
  fs.writeFileSync(filePath, JSON.stringify(posts, null, 2));
  console.log(`Cleaned ${filePath}: ${count} posts updated.`);
}

cleanDuplicateButtons('client/src/data/posts.json');
cleanDuplicateButtons('server/data/wordpress-posts.json');
