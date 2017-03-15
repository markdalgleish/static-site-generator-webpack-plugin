module.exports = function(locals) {
  switch (locals.path) {
    case '/': {
      return locals.template({
        path: locals.path
      });
    }
    default: {
      return '404';
    }
  }
};
