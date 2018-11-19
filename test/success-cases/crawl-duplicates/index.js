module.exports = function(locals) {
  try {
  switch (locals.path) {
    case '/': {
      return locals.template({
        path: locals.path,
        link1: 'foo',
        link2: 'bar'
      });
    }
    case '/foo': {
      return locals.template({
        path: locals.path,
        link1: 'baz?m=1',
        link2: 'baz'
      });
    }
    case '/bar': {
      return locals.template({
        path: locals.path,
        link1: 'baz#oz',
        link2: 'baz'
      });
    }
    case '/baz?m=1':
    case '/baz#oz':
    case '/baz': {
      return locals.template({
        path: locals.path,
        link1: 'baz#oz',
        link2: 'baz'
      });
    }
    default: {
      return '404 ' + locals.path;
    }
  }}
  catch( error) {
    return '500'
  }
};
