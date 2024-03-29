/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Owner: david@famo.us
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

var Constraint = require('./Constraint');
var Vector = require('../../math/Vector');

  /**
   *  A constraint that keeps a physics body a given distance away from a given
   *  anchor, or another attached body.
   *
   *
   *  @class Distance
   *  @constructor
   *  @extends Constraint
   *  @param options {Object}
   */
  function Distance(options) {
      this.options = Object.create(this.constructor.DEFAULT_OPTIONS);
      if (options) this.setOptions(options);

      //registers
      this.impulse  = new Vector();
      this.normal   = new Vector();
      this.diffP    = new Vector();
      this.diffV    = new Vector();

      Constraint.call(this);
  }

  Distance.prototype = Object.create(Constraint.prototype);
  Distance.prototype.constructor = Distance;

  /**
   * @property Distance.DEFAULT_OPTIONS
   * @type Object
   * @protected
   * @static
   */
  Distance.DEFAULT_OPTIONS = {

      /**
       * The location of the anchor
       *
       * @attribute anchor
       * @type Array
       * @optional
       */
      anchor : null,

      /**
       * The amount of distance from the anchor the constraint should enforce
       *
       * @attribute length
       * @type Number
       * @default 0
       */
      length : 0,

      /**
       * The minimum distance before the constraint is activated
       *    Use this property for a "rope" effect
       *
       * @attribute length
       * @type Number
       * @default 0
       */
      minLength : 0,

      /**
       * The spring-like reaction when the constraint is broken
       * @attribute period
       * @type Number
       * @default 0
       */
      period : 0,

      /**
       * The damping-like reaction when the constraint is broken
       * @attribute dampingRatio
       * @type Number
       * @default 0
       */
      dampingRatio : 0
  };

  /** @const */ var pi = Math.PI;

  /**
   * Basic options setter
   *
   * @method setOptions
   * @param options {Objects}
   */
  Distance.prototype.setOptions = function setOptions(options) {
      if (options.anchor) {
          if (options.anchor.position instanceof Vector) this.options.anchor = options.anchor.position;
          if (options.anchor   instanceof Vector)  this.options.anchor = options.anchor;
          if (options.anchor   instanceof Array)  this.options.anchor = new Vector(options.anchor);
      }
      if (options.length !== undefined) this.options.length = options.length;
      if (options.dampingRatio !== undefined) this.options.dampingRatio = options.dampingRatio;
      if (options.period !== undefined) this.options.period = options.period;
      if (options.minLength !== undefined) this.options.minLength = options.minLength;
  };

  function _calcError(impulse, body) {
      return body.mass * impulse.norm();
  }

  /**
   * Set the anchor position
   *
   * @method setOptions
   * @param anchor {Array}
   */
  Distance.prototype.setAnchor = function setAnchor(anchor) {
      if (!this.options.anchor) this.options.anchor = new Vector();
      this.options.anchor.set(anchor);
  };

  /**
   * Adds an impulse to a physics body's velocity due to the constraint
   *
   * @method applyConstraint
   * @param targets {Array.Body}  Array of bodies to apply the constraint to
   * @param source {Body}         The source of the constraint
   * @param dt {Number}           Delta time
   */
  Distance.prototype.applyConstraint = function applyConstraint(targets, source, dt) {
      var n        = this.normal;
      var diffP    = this.diffP;
      var diffV    = this.diffV;
      var impulse  = this.impulse;
      var options  = this.options;

      var dampingRatio = options.dampingRatio;
      var period       = options.period;
      var minLength    = options.minLength;

      if (source) {
          var p2 = source.position;
          var w2 = source.inverseMass;
          var v2 = source.velocity;
      }
      else {
          var p2 = this.options.anchor;
          var w2 = 0;
      }

      var length = this.options.length;

      for (var i = 0; i < targets.length; i++) {
          var body = targets[i];

          var v1 = body.velocity;
          var p1 = body.position;
          var w1 = body.inverseMass;

          diffP.set(p1.sub(p2));
          n.set(diffP.normalize());

          var dist = diffP.norm() - length;

          //rope effect
          if (Math.abs(dist) < minLength) return;

          if (source) diffV.set(v1.sub(v2));
          else        diffV.set(v1);

          var effMass = 1 / (w1 + w2);

          if (period === 0) {
              var gamma = 0;
              var beta  = 1;
          }
          else {
              var c = 4 * effMass * pi * dampingRatio / period;
              var k = 4 * effMass * pi * pi / (period * period);

              var gamma = 1 / (c + dt*k);
              var beta  = dt*k / (c + dt*k);
          }

          var antiDrift = beta/dt * dist;
          var lambda    = -(n.dot(diffV) + antiDrift) / (gamma + dt/effMass);

          impulse.set(n.mult(dt*lambda));
          body.applyImpulse(impulse);

          if (source) source.applyImpulse(impulse.mult(-1));
      }
  };

  module.exports = Distance;

