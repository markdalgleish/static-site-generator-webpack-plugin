module.exports = function(locals) {
  switch (locals.path) {
    case '/': {
      return locals.template({
        path: locals.path,
        src: './foo'
      });
    }
    case '/foo': {
      return locals.template({
        path: locals.path,
        src: './foo/bar'
      });
    }
    case '/foo/bar': {
      return locals.template({
        path: locals.path,
        src: './bar/baz'
      });
    }
    case '/foo/bar/baz': {
      return locals.template({
        path: locals.path,
        src: 'javascript:void(0)'
      });
    }
    default: {
      return '404';
    }
  }
};
