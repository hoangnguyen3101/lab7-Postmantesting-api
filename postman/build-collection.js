// Sinh Postman collection v2.1 (đọc/ import trực tiếp được trong Postman)
const fs = require('fs');
const ev = (lines) => [{ listen: 'test', script: { type: 'text/javascript', exec: lines } }];
const common = [
  'pm.test("Thời gian phản hồi < 1000ms", () => pm.expect(pm.response.responseTime).to.be.below(1000));',
];
const req = (name, method, path, tests, body, desc) => ({
  name, event: ev([...tests, ...common]),
  request: {
    method, description: desc,
    header: body ? [{ key: 'Content-Type', value: 'application/json' }] : [],
    ...(body ? { body: { mode: 'raw', raw: JSON.stringify(body, null, 2), options: { raw: { language: 'json' } } } } : {}),
    url: { raw: '{{baseUrl}}' + path, host: ['{{baseUrl}}'], path: path.split('?')[0].split('/').filter(Boolean),
      ...(path.includes('?') ? { query: path.split('?')[1].split('&').map(q => { const [key, value] = q.split('='); return { key, value }; }) } : {}) },
  },
});
const items = [
  req('01 GET - Lấy danh sách posts', 'GET', '/posts', [
    'pm.test("Status 200", () => pm.response.to.have.status(200));',
    'pm.test("Body là mảng không rỗng", () => { const j = pm.response.json(); pm.expect(j).to.be.an("array").that.is.not.empty; });',
    'pm.test("Mỗi post có đủ userId, id, title, body", () => pm.response.json().forEach(p => pm.expect(p).to.include.all.keys("userId","id","title","body")));',
  ]),
  req('02 GET - Lấy post theo id', 'GET', '/posts/1', [
    'pm.test("Status 200", () => pm.response.to.have.status(200));',
    'pm.test("id = 1", () => pm.expect(pm.response.json().id).to.eql(1));',
    'pm.test("Content-Type là JSON", () => pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json"));',
  ]),
  req('03 GET - Lọc posts theo userId', 'GET', '/posts?userId=1', [
    'pm.test("Status 200", () => pm.response.to.have.status(200));',
    'pm.test("Tất cả post thuộc userId = 1", () => pm.response.json().forEach(p => pm.expect(p.userId).to.eql(1)));',
  ]),
  req('04 GET - Lấy comments của một post', 'GET', '/posts/1/comments', [
    'pm.test("Status 200", () => pm.response.to.have.status(200));',
    'pm.test("Tất cả comment thuộc postId = 1", () => pm.response.json().forEach(c => pm.expect(c.postId).to.eql(1)));',
  ]),
  req('05 POST - Tạo post mới', 'POST', '/posts', [
    'pm.test("Status 201 Created", () => pm.response.to.have.status(201));',
    'pm.test("Dữ liệu trả về khớp dữ liệu gửi", () => { const j = pm.response.json(); pm.expect(j.title).to.eql("Kiểm thử Postman"); pm.expect(j.userId).to.eql(1); });',
    'pm.test("Server cấp id mới", () => pm.expect(pm.response.json().id).to.be.a("number"));',
    'pm.collectionVariables.set("newPostId", pm.response.json().id);',
  ], { title: 'Kiểm thử Postman', body: 'Bài thực hành Lab07', userId: 1 }),
  req('06 PUT - Cập nhật toàn bộ post', 'PUT', '/posts/1', [
    'pm.test("Status 200", () => pm.response.to.have.status(200));',
    'pm.test("Title đã được cập nhật", () => pm.expect(pm.response.json().title).to.eql("Tiêu đề đã sửa"));',
  ], { id: 1, title: 'Tiêu đề đã sửa', body: 'Nội dung đã sửa', userId: 1 }),
  req('07 PATCH - Cập nhật một phần', 'PATCH', '/posts/1', [
    'pm.test("Status 200", () => pm.response.to.have.status(200));',
    'pm.test("Chỉ title thay đổi, id giữ nguyên", () => { const j = pm.response.json(); pm.expect(j.title).to.eql("Tiêu đề patch"); pm.expect(j.id).to.eql(1); });',
  ], { title: 'Tiêu đề patch' }),
  req('08 DELETE - Xoá post vừa tạo', 'DELETE', '/posts/{{newPostId}}', [
    'pm.test("Status 200", () => pm.response.to.have.status(200));',
  ]),
  req('09 GET - Post đã xoá trả về 404 (negative test)', 'GET', '/posts/{{newPostId}}', [
    'pm.test("Status 404 Not Found", () => pm.response.to.have.status(404));',
  ], null, 'Kiểm thử âm: tài nguyên đã xoá phải không còn truy cập được.'),
  req('10 GET - id không tồn tại trả về 404', 'GET', '/posts/99999', [
    'pm.test("Status 404 Not Found", () => pm.response.to.have.status(404));',
  ]),
];
const collection = {
  info: { name: 'Lab07 - JSONPlaceholder API Tests', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    description: 'Bộ kiểm thử REST API (CRUD) bằng Postman. Đổi biến baseUrl để trỏ sang https://jsonplaceholder.typicode.com.' },
  item: items,
  variable: [{ key: 'baseUrl', value: 'http://localhost:3000' }, { key: 'newPostId', value: '' }],
};
fs.writeFileSync(__dirname + '/Lab07.postman_collection.json', JSON.stringify(collection, null, 2));
fs.writeFileSync(__dirname + '/jsonplaceholder.postman_environment.json', JSON.stringify({
  name: 'JSONPlaceholder (public)', values: [{ key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com', enabled: true }], _postman_variable_scope: 'environment' }, null, 2));
fs.writeFileSync(__dirname + '/local-mock.postman_environment.json', JSON.stringify({
  name: 'Local mock (json-server)', values: [{ key: 'baseUrl', value: 'http://localhost:3000', enabled: true }], _postman_variable_scope: 'environment' }, null, 2));
