module.exports = function(locals) {
  switch (locals.path) {
    case '/': {
      return locals.template({
        path: locals.path,
        link: 'foo'
      });
    }
    case '/foo': {
      return locals.template({
        path: locals.path,
        link: './foo/bar'
      });
    }
    case '/foo/bar': {
      return locals.template({
        path: locals.path,
        link: './bar/baz'
      });
    }
    case '/foo/bar/baz': {
      return locals.template({
        path: locals.path,
        link: '../../../'
      });
    }
    default: {
      return '404';
    }
  }
};
