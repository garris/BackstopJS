
# Change Log

## Unreleased

Puppeteer 25.13.0 removes the flagged `extract-zip` dependency from the browser installer (#1625).

This update requires Node.js 22.12.0 or newer. Upgrade Node.js before installing this version.
The Docker base image and Travis tests now use Node.js 22.
Puppeteer's newer Chrome can change screenshot rendering. Review visual differences before approving new reference images.

Existing `ignoreHTTPSErrors` and `headless: "new"` settings still work with Puppeteer's current launch options.
Use `acceptInsecureCerts` for new Puppeteer configurations. Explicit `false` values keep certificate validation enabled.

 
## [6.0.4] - 2021-12-10
### Added

### Changed
- Bump puppeteer to v12 (#1381)
- Travis remove node 10, 12 test runs

### Fixed 



 
## [6.0.1] - 2021-11-17
### Added
- PLAYRIGHT ENGINE OPTION  thank you JB

### Changed
- support for viewport variants with dynamic scenario mode to browser and json report (#1376)  thank you TW

### Fixed 
- Fixed Puppeteer ENOENT Error When Image Stubbing (#1377)



 
## [5.4.3] - 2021-08-24
### Added
- added archive report feature (#1353)
  - requested a housekeeping followup PR
  - documentaiton will be commented until 2nd PR is submitted.


### Changed
- More code formatting and some test cleanups
- updated readme

### Fixed 



 
## [5.4.1] - 2021-08-24
### Added
- Feature: archive report (#1353)  @klodoma



### Changed
- Added no-cache tags to client markup (#1357)
- code formatting, addressed lint warnings

### Fixed 




## [5.3.6] - 2021-07-29

### Added


### Changed


### Fixed
- https://github.com/garris/BackstopJS/issues/1344
  Fixed rendering issue found in Backstop (docker) versions > 4.4.2.
 

## [5.3.7] - 2021-07-29
### Added
- Changelog

### Changed


### Fixed 


## [5.3.6] - 2021-07-29

### Added


### Changed


### Fixed
- https://github.com/garris/BackstopJS/issues/1344
  Fixed rendering issue found in Backstop (docker) versions > 4.4.2.
 

 
## [5.3.5] - 2021-07-20

### Added
- New Config feature `readyEventTimeout`
- New Config feature `usePreciseMatching`


### Changed
- Bumped Node version in docker config


### Fixed

