
/**
 * This class represents one unit of measure.  It includes
 * functions to cover constructor, accessor, and assignment tasks as
 * well as operators to calculate multiplication, division and raising
 * to a power.
 *
 * @author Lee Mericle, based on java version by Gunther Schadow
 *
 */

import * as Ucum from "config.js" ;
class Unit {

  /**
   * Constructor.
   *
   * @param attrs an optional parameter that may be:
   *  a string, which is parsed by the unit parser, which creates
   *  the unit from the parsed string; or
   *  a hash containing all or some values for the attributes of
   *  the unit, where the keys are the attribute names, without a
   *  trailing underscore, e.g., name instead of name_; or
   *  null, in which case an empty hash is created and used to
   *  set the values forthe attributes.
   *  If a hash (empty or not) is used, attributes for which no value
   *  is specified are assigned a default value.
   *
   */
  constructor(attrs = {}) {

    // If this instance is defined by a string, use the UnitParser
    // to create the unit

    if (typeof attrs === 'string') {
      let parser = new UnitParser(attrs);
      try {
        parser.parse(this);
      }
      catch (x) {
        throw(`Parse error: ${x.getMessage()}`);
      }
      // This doesn't make any sense.
      //if (Ucum.caseSensitive_)
      //  this.name = attrs;
      //else
      //  this.name = attrs.toUpperCase();

    } // end if this instance is defined by a string

    else {
      // This instance is defined by a (possibly empty) hash of values.
      // Create and assign values (from the attrs hash or defaults) to all
      // attributes.  From Class Declarations in Understanding ECMAScript,
      // https://leanpub.com/understandinges6/read/#leanpub-auto-class-declarations,
      //   "Own properties, properties that occur on the instance rather than the
      //    prototype, can only be created inside of a class constructor or method.
      //    It's recommended to create all possible own properties inside of the
      //    constructor function so there's a single place that's responsible for
      //    all of them."

      /*
       * The base unit name, e.g., meter
       */
      this.name_ = attrs['name'] || '';

      /*
       * The unit's case-sensitive code, e.g., m
       */
      this.csCode_ = attrs['csCode'] || '';

      /*
       * The unit's case-insensitive code, e.g., M
       */
      this.ciCode_ = attrs['ciCode'] || '';

      /*
       * The unit's property, e.g., length
       */
      this.property_ = attrs['property'] || '';

      /*
       * The magnitude of the unit, e.g., 3 for
       * 3 meters - where meters is the base unit
       */
      this.magnitude_ = attrs['magnitude'] || 1;

      /*
       * The Dimension object of the unit
       */
      this.dim_ = attrs['dim'] || null;

      /*
       * The print symbol of the unit, e.g., L
       */
      this.printSymbol_ = attrs['dimCode'] || null;

      /*
       * The print symbol of the unit, e.g., m
       */
      this.printSym_ = attrs['printSym'] || null;

      /*
       * The class of the unit, where given, e.g., dimless
       */
      this.class_ = attrs['class'] || null;

      /*
       * A flag indicating whether or not the unit is metric
       */
      this.isMetric_ = attrs['isMetric'] || true;

      /*
       * The conversion function
       */
      this.cnv_ = attrs['cnv'] || null;

      /*
       * The conversion prefix
       */
      this.cnvPfx_ = attrs['cnvPfx'] || 1;

    } // end if this constructor uses a (possibly empty) hash
      // to define the instance

  } // end constructor


  /**
   * Assign the unity (= dimensionless unit 1) to this unit.
   *
   * @return this unit
   */
  assignUnity() {
    this.name_  = "" ;
    this.magnitude_ = 1 ;
    this.dim_.assignZero() ;
    this.cnv_ = null ;
    this.cnvPfx_ = 1 ;
    return this;

  } // end assignUnity


  /**
   * This assigns one or more values, as provided in the hash passed in,
   * to this unit.
   *
   * @param vals hash of values to be assigned to the attributes
   *        specified by the key(s), which should be the attribute
   *        name without the trailing underscore, e.g., name instead
   *        of name_.
   * @return nothing
   */
  assignVals(vals) {
    for (let key in vals) {
      let uKey = (!(key.endsWith('_'))) ? key + '_' : key ;
      if this.hasOwnProperty(uKey)
        this[uKey] = vals[key];
      else
        throw(`Parameter error; ${key} is not a property of a Unit`) ;
    }
  } // end assignVals


  /**
   * This creates a clone of this unit.
   *
   * @return the clone
   */
  clone() {
    let retUnit = new Unit() ;
    Object.getOwnPropertyNames(this).forEach(val => {
      retUnit[val] = this[val];
    });
    return retUnit ;

  } // end clone


  /**
   * This assigns all properties of a unit passed to it to this unit.
   *
   * @param the unit whose properties are to be assigned to this one.
   * @return nothing; this unit is updated
   */
  assign(unit2) {
    Object.getOwnPropertyNames(unit2).forEach(val => {
      if (this.val !== undefined)
        this[val] = unit2[val] ;
      else
         throw(`Parameter error; ${val} is not a property of a Unit`) ;
    });
  } // end assign


  /**
   * This determines whether or not object properties of the unit
   * passed in are equal to the corresponding properties in this unit.
   * The following properties are the only ones checked:
   *   magnitude_, dim_, cnv_ and cnvPfx_
   *
   * @param unit2 the unit whose properties are to be checked.
   * @return boolean indicating whether or not they match
   */
  equals(unit2) {

    return (this.magnitude_ === unit2.magnitude_ &&
            this.dim_.equals(unit2.dim_ &&
            this.cnv_ === unit2.cnv_ &&
            this.cnvPfx_ === unit2.cnvPfx_);

  } // end equals


  /**
   * This returns the value of the property named by the parameter
   * passed in.
   *
   * @param propertyName name of the property to be returned, with
   *        or without the trailing underscore.
   * @return the requested property, if found for this unit
   * @throws an error if the property is not found for this unit
   */
  getProperty(propertyName) {
    let uProp = (!(propertyName.endsWith('_'))) ? propertyName + '_' :
                                                  propertyName ;
    if (!(this.hasOwnProperty(uProp)))
      throw(`Unit does not have requested property (${propertyName}`);
    else
      return this[uProp] ;

  } // end getProperty


  /**
   * Takes a measurement consisting of a magnitude and a unit and returns
   * the equivalent magnitude of this unit.  So, 15 mL would translate
   * to 1 tablespoon.
   *
   * @param mag the magnitude for the unit to be translated (e.g. 15 for 15 mL)
   * @param fromUnit the unit to be translated to one of this type (e.g. a mL unit)
   *
   * @return the converted magnitude value (e.g. 1 for 1 tablespoon)
   * @throws an error if the dimension of the fromUnit differs from this unit's dimension
   */
  convertFrom(mag, fromUnit) {
    let newMag = 0.0 ;

    // reject request if the dimensions are not equal
    if (!(fromUnit.dim_.equals(this.dim_))) {
      throw(`${fromUnit.name_} units cannot be converted to ${this.name_} units.`)
    }
    let fromCnv = fromUnit.cnv_ ;
    let fromMag = fromUnit.magnitude_ ;

    // if both units are on a ratio scale, multiply the "from" unit's magnitude
    // by the magnitude passed in and then divide that result by this unit's magnitude
    if (fromCnv == null && this.cnv_ == null)
      newMag = (mag * fromMag)/this.magnitude_;

    // else use a function to get the magnitude to be returned
    else {
      let x = 0.0 ;
      if (fromCnv != null) // turn mag * fromUnit.magnitude into its ratio scale equivalent
        x = fromCnv.f_from(mag * fromUnit.cnvPfx_) * fromMag;
      else
        x = mag * fromMag;

      if (this.cnv_ != null) // turn mag * origUnit on ratio scale into a non-ratio unit
        newMag = this.cnv_.f_to(x / this.magnitude_) / this.cnvPfx_;
      else
        newMag = x / this.magnitude_;
    } // end if both units are NOT on a ratio scale

    return newMag;

  } // end convertFrom


  /**
   * Takes a magnitude and a target unit and returns the magnitude for a measurement
   * of this unit that corresponds to the magnitude of the target unit passed in.
   * So, 1 tablespoon (where this unit represents a tablespoon) would translate to 15 mL.
   *
   * @param mag the magnitude for this unit (e.g. 1 for 1 tablespoon)
   * @param toUnit the unit to which this unit is to be translated (e.g. an mL unit)
   *
   * @return the converted magnitude value (e.g. 15 mL)
   * @throws an error if the dimension of the toUnit differs from this unit's dimension
   */
  convertTo(mag, toUnit) {

    return toUnit.convertFrom(mag, this) ;

  } // end convertTo


  /**
   * Takes a given magnitude of this unit returns the magnitude of this unit
   * if it is converted into a coherent unit.  Does not change this unit.
   *
   * If this is a coherent unit already, just gives back the magnitude
   * passed in.
   *
   * @param mag the magnitude for the coherent version of this unit
   * @return the magnitude for the coherent version of this unit
   */
  convertCoherent(mag) {

    // convert mag' * u' into canonical mag * u on ratio scale
    if(this.cnv_ == null)
      mag = this.cnv_.f_from(mag / this.cnvPfx_) * this.magnitude_;

    return mag;

  } // end convertCoherent


  /**
   * Mutates this unit into a coherent unit and converts a given magnitude
   * to the appropriate value for this unit as a coherent unit
   *
   * @param mag the magnitude for this unit before conversion
   * @return the magnitude of this unit after conversion
   * @throws an error if the dimensions differ
   */
  mutateCoherent(mag) {

    // convert mu' * u' into canonical mu * u on ratio scale
    mag = this.convertCoherent(mag) ;

    // mutate to coherent unit
    this.magnitude_ = 1;
    this.cnv_ = null;
    this.cnvPfx_ = 1;
    this.name_ = "";

    // build a name as a term of coherent base units
    // This is probably ALL WRONG and a HORRIBLE MISTAKE
    // but until we figure out what the heck the name being
    // built here really is, it will have to stay.
    for (let i = 0, max = Dimension.getMax(); i < max; i++) {
      let elem = this.dim_.elementAt(i);
      let uA = UnitTables.getUnitByDim(new Dimension(i));
      if(uA == null)
        throw(`Can't find base unit for dimension ${i}`);
      this.name_ = uA.name + elem;
    }
    return mag;

  } // end mutateCoherent


  /**
   * Mutates this unit into a unit on a ratio scale and converts a specified
   * magnitude to an appropriate value for this converted unit
   *
   * @param mag the magnitude of this unit before it's converted
   * @return the magnitude of this unit after it's converted
   * @throw an error if the dimensions differ
   */
  mutateRatio(mag) {
    if (this.cnv_ == null)
      return this.mutateCoherent(mag);
    else
      return mag;

  } // end mutateRatio


  /**
   * Multiplies this unit with a scalar. Special meaning for
   * special units so that (0.1*B) is 1 dB.
   *
   * This function modifies this unit.
   *
   * @param s the value by which this unit is to be multiplied
   * @return this unit after multiplication
   */
  multiplyThis(s) {

    if(this.cnv_ != null)
      this.cnvPfx_ *= s;
    else
      this.magnitude_ *= s;
    return this;

  } // end multiplyThis


  /**
   * Multiplies this unit with another unit. If one of the
   * units is a non-ratio unit the other must be dimensionless or
   * else an exception is thrown. This special case treatment allows
   * us to scale non-ratio units.
   *
   * This function modifies this unit
   * @param unit2 the unit to be multiplied with this one
   * @return this unit after it is multiplied
   * @throws an error if one of the units is not on a ratio-scale
   *         and the other is not dimensionless.
   */
  multiplyThese(unit2) {

    if (this.cnv_ != null) {
      if (unit2.cnv_ == null && unit2.dim_.isZero())
	      this.cnvPfx_ *= unit2.magnitude_;
      else
	      throw (`Attempt to multiply non-ratio unit ${this.name_} failed.`);
    }
    else {
      if (unit2.cnv_ != null) {
        if (this.cnv_ == null && this.dim_.isZero()) {
          let cp = this.magnitude_;
          assign(unit2);
          this.cnvPfx_ *= cp;
        }
        else
          throw (`Attempt to multiply non-ratio unit ${u2Nname}`);
      }
      else {
        this.name_ = UnitString.mul(this.name_, unit2.name_);
        this.magnitude_ *= unit2.magnitude_;
        this.dim_.add(unit2.dim_);
      }
    }
    return this;

  } // end multiplyThese


  /**
   * Divides this unit by another unit. If this unit is not on a ratio
   * scale an exception is raised. Mutating to a ratio scale unit
   * is not possible for a unit, only for a measurement.
   *
   * This unit is modified by this function.
   * @param unit2 the unit by which to divide this one
   * @return this unit after it is divided by unit2
   * @throws an error if either of the units is not on a ratio scale.
   * */
  divide(unit2) {

    if (this.cnv_ != null)
      throw (`Attempt to divide non-ratio unit ${this.name_}`);
    if (unit2.cnv_ != null)
      throw (`Attempt to divide non-ratio unit ${unit2.name_}`);

    this.name_ = UnitString.div(this.name_, unit2.name_);

    this.magnitude_ /= unit2.magnitude_;
    this.dim_.sub(unit2.dim_);
    
    return this;

  }// end divide

  
  /**
   * Invert this unit with respect to multiplication. If this unit is not
   * on a ratio scale an exception is thrown. Mutating to a ratio scale unit
   * is not possible for a unit, only for a measurement (the magnitude and
   * dimension).
   *
   *  This unit is modified by this function.
   * @return this unit after being inverted
   * @throws and error if this unit is not on a ratio scale
   */
  invert() {

    if (this.cnv_ != null)
      throw (`Attempt to invert a non-ratio unit - ${this.name_}`);

    this.name_ = UnitString.inv(this.name_);

    this.magnitude_ = 1/this.magnitude_ ;
    this.dim_.minus();
    return this;

  } // end invert

  
  /**
   * Raises this unit to a power.  If this unit is not on a
   * ratio scale an error is thrown. Mutating to a ratio scale unit
   * is not possible for a unit, only for a measurement (magnitude
   * and dimension).
   *
   * This unit is modified by this function
   * @param p the power to with this unit is to be raise
   * @return this unit after it is raised
   * @throws an error if this unit is not on a ratio scale.
   */
  power(p) {

    if (this.cnv_ != null)
      throw (`Attempt to raise a non-ratio unit, ${this.name_}, to a power.`);

    this.name_ = UnitString.pow(this.name_, p);
    this.magnitude_ = Math.pow(this.magnitude_, p);
    this.dim_.mul(p);
    return this;

  } // end power

} // end Unit class
