module.exports = function(locals) {
  return '<div>' + locals.chunks.join('<br />') + '</div>';
};
