export const MeasurementHandle = function () {
  let _action = null;
  let _views = [];

  let withView = function (wv) {
    for (let i = 0; i < _views.length; i++) wv.bind(this)(_views[i]);
  }.bind(this);
  let setAction = (action) => {
    _action = action;
    return this;
  };
  let addView = (view) => {
    _views.push(view);
    return this;
  };
  let start = () => {
    if (_action) _action.start();
    withView((view) => {
      if (view.start) view.start(getResult());
    });
    return this;
  };
  let reset = () => {
    if (_action) _action.reset();
    withView((view) => {
      if (view.reset) view.reset();
    });
    return this;
  };
  let destroy = () => {
    if (_action) _action.destroy();
    withView((view) => {
      view.destroy();
    });
  };
  let getResult = () => {
    return {
      coordinates: _action.value,
      setting: _action.setting,
      ..._action.getResult()
    };
  };
  let add = (point) => {
    if (_action) _action.add(point);
    withView((view) => {
      if (view.view) view.view(getResult());
    });
    return this;
  };
  let init = (points = []) => {
    if (_action) _action.init(points);
    withView((view) => {
      view.view(getResult());
    });
    return this;
  };
  return {
    get type() {
      if (!_action) return null;
      return _action.type;
    },
    get action() {
      return _action;
    },
    setAction,
    addView,
    start,
    reset,
    destroy,
    add,
    init,
    getResult
  };
};
