/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: mark@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

var Surface = require('../core/Surface');

  /**
   * Creates a famous surface containing video content. Currently adding
   *   controls and manipulating the video are not supported through the
   *   surface interface, but can be accomplished via standard JavaScript
   *   manipulation of the video DOM element.
   *   This extends the Surface class.
   *
   * @class VideoSurface
   * @extends Surface
   * @constructor
   * @param {Object} [options] default option overrides
   * @param {Array.Number} [options.size] [width, height] in pixels
   * @param {Array.string} [options.classes] CSS classes to set on inner content
   * @param {Array} [options.properties] string dictionary of HTML attributes to set on target div
   * @param {string} [options.content] inner (HTML) content of surface
   * @param {boolean} [options.autoplay] autoplay
   */
  function VideoSurface(options) {
      this._videoUrl = undefined;
      this.options = Object.create(VideoSurface.DEFAULT_OPTIONS);
      if (options) this.setOptions(options);

      Surface.apply(this, arguments);
  }
  VideoSurface.prototype = Object.create(Surface.prototype);
  VideoSurface.prototype.constructor = VideoSurface;

  VideoSurface.DEFAULT_OPTIONS = {
      autoplay: false
  };

  VideoSurface.prototype.elementType = 'video';
  VideoSurface.prototype.elementClass = 'famous-surface';

  /**
   * Set internal options, overriding any default options
   *
   * @method setOptions
   *
   * @param {Object} [options] overrides of default options
   * @param {Boolean} [options.autoplay] HTML autoplay
   */
  VideoSurface.prototype.setOptions = function setOptions(options) {
      for (var key in VideoSurface.DEFAULT_OPTIONS) {
          if (options[key] !== undefined) this.options[key] = options[key];
      }
  };

  /**
   * Set url of the video.
   *
   * @method setContent
   * @param {string} videoUrl URL
   */
  VideoSurface.prototype.setContent = function setContent(videoUrl) {
      this._videoUrl = videoUrl;
      this._contentDirty = true;
  };

  /**
   * Place the document element this component manages into the document.
   *   Note: In the case of VideoSurface, simply changes the options on the target.
   *
   * @private
   * @method deploy
   * @param {Node} target document parent of this container
   */
  VideoSurface.prototype.deploy = function deploy(target) {
      target.src = this._videoUrl;
      target.autoplay = this.options.autoplay;
  };

  /**
   * Remove this component and contained content from the document.
   *   Note: This doesn't actually remove the <video> element from the
   *   document.
   * @private
   * @method recall
   *
   * @param {Node} target node to which the component was deployed
   */
  VideoSurface.prototype.recall = function recall(target) {
      target.src = '';
  };

  module.exports = VideoSurface;

