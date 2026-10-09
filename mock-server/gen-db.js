// Sinh db.json cùng cấu trúc với JSONPlaceholder (users/posts/comments)
const users = [], posts = [], comments = [];
for (let u = 1; u <= 5; u++) users.push({ id: u, name: `User ${u}`, username: `user${u}`, email: `user${u}@example.com` });
for (let p = 1; p <= 25; p++) {
  posts.push({ userId: Math.ceil(p / 5), id: p, title: `Post title ${p}`, body: `Body of post ${p}` });
  for (let c = 1; c <= 3; c++) comments.push({ postId: p, id: (p - 1) * 3 + c, name: `Comment ${c} of post ${p}`, email: `commenter${c}@example.com`, body: `Comment body ${c}` });
}
require('fs').writeFileSync(__dirname + '/db.json', JSON.stringify({ users, posts, comments }, null, 2));
