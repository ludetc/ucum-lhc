# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).


## [2.1.0] - 2017-12-21
- Upgraded the validation processing for conversion request on the
demo page; validation is now performed on the fly as each element
is entered.  This is a change only to the demo page.

## [2.0.0] - 2017-12-01
- Added ability to get suggestions for invalid unit expressions.

## [1.2.0] - 2017-10-06
- Enhanced unit string validation to accommodate/correct:
  - missing multiplication operators, e.g., **2mg** instead of **2.mg**;
  - unit name specified instead of ucum code, e.g., **day** instead of **d**;
  - misplaced annotations, e.g., **{creatine}**mol** instead of mol**{creatine}**;
  - missing square brackets, e.g., **in_i** instead of **[in_i]**; and
  - braces instead of brackets, e.g., **{degF}** instead of **[degF]**. 

## [1.1.2] - 2017-08-07
- Updated unit creation process to include updates to case-insensitve codes 
and print symbol values when creating a unit from multiple units.
- Updated treatment of prefixes for special units that use conversion 
functions to record prefix values in the separate conversion prefix field.


## [1.1.1] - 2017-07-13
- Data file has been updated with enhanced synonyms and is also now written 
in a a readable JSON format.


## [1.1.0] - 2017-07-06
## Changed
- Autocompleters no longer return multiple-unit strings, e.g., kg/cm.  
Multiple-unit strings are still (very) valid, but the autocompleters just 
return one list single-unit strings at a time.  
- The commensurables list on the conversion tab's "convert to" field has been 
changed to just use the same autocompleter as used for the "convert from" field. 
The list will now include units that cannot be converted.


## [1.0.2] - 2017-06-23
## Fixed
- Allowed conversion of units with no dimensions
- added testing for the Unit.convertFrom and Unit.convertTo functions


## [1.0.1] - 2017-05-30
## Added
- This change log.

### Changed
- Streamlined divString function in Unit.js
- Moved parenthesized unit string processing to separate function
in UnitString.js (processParens).
- Added testing for the processParens function in testUnitString.spec.js

### Fixed
- Updated UcumFileValidator.js with previously changed function name 
(validUnitString -> validateUnitString in UcumLhcUtils.js).