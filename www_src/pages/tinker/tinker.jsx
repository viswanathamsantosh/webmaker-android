var React = require('react');
var render = require('../../lib/render.jsx');
var api = require('../../lib/api');
var elementTypes = require('../../components/el/el.jsx').types;
var assign = require('react/lib/Object.assign');

var Tabs = require('../../components/tabs/tabs.jsx');
var ColorSpectrum = require('../../components/color-spectrum/color-spectrum.jsx');
var Loading = require('../../components/loading/loading.jsx');

/**
 * Tinker: Advanced editor for specific element attributes or styles
 *
 * Props
 *   @key {boolean} isVisible Indicates if the Tinker Activity is currently visible (not paused)

 * State
 *   @key {boolean} loading If true, loading spinner is shown and UI is blocked
 *   @key {object} element Represents flattened element data (via spec.flatten)

 *   From router:
 *   @key {object} params Contains params user, project, page, element, propertyName
 */
var Tinker = React.createClass({

  mixins: [require('../../lib/router')],

  getInitialState: function () {
    return {
      loading: false,
      element: null
    };
  },

  componentDidMount: function () {

    // Prevent pull to refresh
    document.body.style.overflowY = 'hidden';

    this.load();

    this.props.update({
      onBackPressed: () => {
        this.save(() => window.Android.goBack());
      }
    });

  },

  /**
   * If tinker activity switches from paused to resumed, re-load data from the API
   */
  componentDidUpdate: function (prevProps, prevState) {
    if (this.props.isVisible && !prevProps.isVisible) {
      this.load();
    }
  },

  /**
   * Load element data from API, based on router params
   */
  load: function () {
    this.setState({loading: true});
    api.getElement(this.state.params, (err, element) => {
      this.setState({loading: false});
      if (err) {
        return console.error(err);
      }
      var spec = elementTypes[element.type].spec;
      if (!spec.spec[this.state.params.propertyName]) {
        return;
      }

      this.setState({
        element: spec.flatten(element),
        editor: spec.spec[this.state.params.propertyName].editor || 'color'
      });
    });
  },

  /**
   * Save current element state in API
   * Triggered in componentDidUpdate
   */
  save: function (onSaveComplete) {
    var element = this.state.element;
    var propertyName = this.state.params.propertyName;
    var spec = elementTypes[element.type].spec;
    var isStyleOrAttribute = spec.isStyleOrAttribute(propertyName);
    var updateObject = {};
    updateObject[isStyleOrAttribute] = spec.expand(element)[isStyleOrAttribute];

    this.setState({loading: true});
    var options = assign({}, this.state.params, {json: updateObject});
    api.updateElement(options, (err, element) => {
      this.setState({loading: false});
      if (err) {
        console.error(err);
      }
      if (typeof onSaveComplete === 'function') {
        onSaveComplete();
      }
    });
  },

  getEditorValue: function () {
    return this.state.element && this.state.element[this.state.params.propertyName];
  },

  setEditorValue: function (value) {
    var edits = {};
    edits[this.state.params.propertyName] = value;
    this.setState({
      element: assign({}, this.state.element, edits)
    });
  },

  render: function () {

    var contents;

    if (this.state.element) {
      var PreviewComponent = elementTypes[this.state.element.type];
      contents = (
        <div className="editor-flex-container">
          <div className="editor-preview">
            <PreviewComponent {...this.state.element} />
            <button className="debug" onClick={this.save} hidden={window.Android}>DEBUG:SAVE</button>
          </div>
          <div className="color-preview">
            <code>color: {this.getEditorValue()};</code>
            <div className="color-preview-right">
              <div className="color-preview-swatch"><div style={{backgroundColor: this.getEditorValue()}} /></div>
            </div>
          </div>
          <Tabs className="editor-options" tabs={[
            {
              title: 'Color Spectrum',
              menu: <img className="icon" src="../../img/pencil.svg" />,
              body: <ColorSpectrum HSB={true} Alpha={true} color={this.getEditorValue()} onChange={this.setEditorValue} />
            },
            {
              title: 'RGBA Picker',
              menu: <img className="icon" src="../../img/settings.svg" />,
              body: <ColorSpectrum RGB={true} Alpha={true} color={this.getEditorValue()} onChange={this.setEditorValue} />
            }
          ]} />
        </div>
      );
    }

    return <div id="tinker">
      {contents}
      <Loading on={this.state.loading} />
    </div>;
  }
});

render(Tinker);
