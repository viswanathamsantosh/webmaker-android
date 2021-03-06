var React = require('react/addons');
var classNames = require('classnames');
var ColorGroup = require('../../components/color-group/color-group.jsx');
var Slider = require('../../components/range/range.jsx');
var ImageBlock = require('../../components/el/types/image.jsx');

var ImageEditor = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function () {
    // Expose image handler to Android
    window.imageReady = this.imageReady;
    return ImageBlock.spec.flatten(this.props.element, {defaults: true});
  },
  componentDidUpdate: function (prevProps) {
    this.props.cacheEdits(this.state);

    // Update state if parent properties change
    if (this.props.element !== prevProps.element) {
      var state = this.getInitialState();
      this.setState(state);
    }

  },
  render: function () {
    return (
      <div id="editor">
        <div className="editor-preview">
          <ImageBlock {...this.state} />
        </div>
        <div className="editor-options">
          <div className="form-group">
            <button onClick={this.toggleMenu} className="btn btn-block">
              <img className="icon" src="../../img/change-image.svg" /> Change Image
            </button>
          </div>
          <div className="form-group">
            <label>Opacity</label>
            <Slider id="opacity" min={0} max={1} step={0.01} linkState={this.linkState} />
          </div>
          <div className="form-group">
            <label>Border Color</label>
            <ColorGroup id="borderColor" linkState={this.linkState} params={this.props.params} onLaunchTinker={this.props.save} />
          </div>
          <div className="form-group">
            <label>Border Width</label>
            <Slider id="borderWidth" max={10} unit="px" linkState={this.linkState} />
          </div>
          <div className="form-group">
            <label>Corner Radius</label>
            <Slider id="borderRadius" min={0} value={this.state.borderRadius} max={32} unit="px" linkState={this.linkState} />
          </div>
        </div>

        <div className={classNames({overlay: true, active: this.state.showMenu})} onClick={this.toggleMenu}/>
        <div className={classNames({controls: true, active: this.state.showMenu})}>
          <button onClick={this.onCameraClick}>
            <img className="icon" src="../../img/take-photo.svg" />
            <p>Take Photo</p>
          </button>
          <button onClick={this.onMediaClick}>
            <img className="icon" src="../../img/camera-gallery.svg" />
            <p>Camera Gallery</p>
          </button>
        </div>
      </div>
    );
  },
  toggleMenu: function () {
    this.setState({showMenu: !this.state.showMenu});
  },
  onCameraClick: function () {
    // Because a Pause/Resume is caused by the camera activity launching,
    // this will trigger an API call when we resume; we need to cancel this
    // in order for the new image to be loaded/saved.
    this.props.cancelDataRefresh();

    this.toggleMenu();
    if (window.Android) {
      window.Android.getFromCamera();
    }
  },
  onMediaClick: function () {
    // Because a Pause/Resume is caused by the camera activity launching,
    // this will trigger an API call when we resume; we need to cancel this
    // in order for the new image to be loaded/saved.
    this.props.cancelDataRefresh();

    this.toggleMenu();
    if (window.Android) {
      window.Android.getFromMedia();
    }
  },
  imageReady: function (uri) {
    this.setState({
      src: uri
    });
    this.props.save();
  }
});

module.exports = ImageEditor;
