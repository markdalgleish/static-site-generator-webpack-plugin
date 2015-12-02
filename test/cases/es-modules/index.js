export default (locals, callback) => {
  const html = '<h1>ES Modules Test</h1>';
  const content = locals.template({ html });
  setTimeout(() => callback(null, content), 10);
};
