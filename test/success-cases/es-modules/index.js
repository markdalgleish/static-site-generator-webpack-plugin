export default ({ template, path }, callback) => {
  const html = `<h1>${path}</h1>`;
  const content = template({ html });
  setTimeout(() => callback(null, content), 10);
};
