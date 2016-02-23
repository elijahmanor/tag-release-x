## 3.x

### 3.10.0

* This is a test

### 3.9.0

* This is another test
* Sending string keys for enumerated values

### 1.13.1
* Added support for updating `isBlocked` property on card update
* Call create card proxy with lane and index
* Allow `null` value for card update blockReason when isBlocked is false
* Ensure that card update tests check that an error was thrown

### 1.13.0
* Feature: Edit Comment

### 1.12.0
* Added card update endpoint (proxied to Kanban app)

### 1.11.0
* Added delegateSameBoard action to connection resource
* Same board connections do not count against the single connection when multiple connections is turned off.
* Updated reset method to clear all cache hashes in authorization module.

### 1.10.0
* Added card add comment endpoint

### 1.9.2
* Update core-node-sql & hyped to fix empty arrays in board response to match already documented schema
* Drone can only run the behavior tests at this time

### 1.9.1
* Added swagger documentation for board list and get

### 1.9.0
* Added card delete endpoint (proxied to Kanban app)

### 1.8.1
* Fixed issue where a lost connection to rabbit resulted in permanent lost subscription to core.api.events queue.

### 1.8.0
* Added card create endpoint (proxied to Kanban app)

### 1.7.2
* Updated metrics exchange names to correct delimiter

### 1.7.1
* Update `core-aspnet-auth` dependency to fix Basic Auth issue with ":" in passwords
* Remove `riaktive` dependency

### 1.7.0

* Added endpoint for retrieving the current account

### 1.6.2

* Changed how `kanbanAppProxy` is registered/required

### 1.6.1

* Added generic Kanban app proxy functionality
* Fixed issues with card schemas in swagger

### 1.6.0
* Added new card minimal schema
* Fixed card list response schema
* Updated to support Redis .Net sessions and latest web common init (includes Basic/Token auth)
* Fixed unit test failures (unhandled rejections)

### 1.5.0
Added endpoints (and swagger docs) to create, list, and revoke authentication tokens.

### 1.4.0
* Added swagger endpoint for the api
* Now blocked.date is populated in card response

### 1.3.0
Added card list endpoint (card search)

### 1.2.1
Updated dependencies to fix authentication issue (user wouldn't be logged out when logging out of .net)

### 1.2.0
 * Added card GET endpoint
 * Added autohost pubsub
 * Updated core-aspnet-auth to address socket misbehavior
 * Added schemas for card GET and card list
 * Removed autohost-memwatch

### 1.1.3
Changes to the Dockerfile for build

### 1.1.2
Update to dependencies:
 * Seriate - 0.5.4
 * hyped - 0.5.1
 * @lk/web-common-init - 0.2.16
 * @lk/core-node-sql - 1.2.1

These changes are being made in an effort to eliminate potential causes for the production memory related restarts.

### 1.1.1
_Never released_

### 1.1.0
* Now updates board version cache on breakout, delegate and delete
* Include parentBoardVersion and boardVersion as part of the response to breakout, delegate and delete
* Delegate option is no longer included when multi connections is disabled and there is an existing connection

### 1.0.1
* Added redis configuration and wireup on boot

### 1.0.0
* Authorization now in place for connections list and statistics self.
* Add drillthrough check for userCanSeeConnection
* Updated hyped version. Fixed broken options test expectation.
* Removed unused auth function and unnecessary account check
* Return 0 in stats for connections without cards
* Updated specs to reflect authorization changes
* Card id is now a string in statistics response


### 0.1.9

* Refactored and optimized authorization for connections and statistics.
* Updated core-node-sql to 1.0.0-multiboard.10
* First pass at moving away from session securityPrincipal
* This includes the self link in the statistics response
* Updated to latest @lk/core-node-sql
* Updated min version of core-node-sql



### 0.1.8

* Added endpoint for listing connections for card
* Split connection `create` into `breakout` and `delegate` actions
* Added support for board search and pagination
* Added `me` action on user so it can be auth'd apart from `user/:id`
* Updated web-common-init to v0.2.9 (adds autohost middleware)
* Added middleware for validating integer ids in urls
* Added middleware for validating request bodies against a schema
* Moved authorization into the `authorize` predicate
* Add support for getting DTStats from the original service
* 404 when stats are unavailable
* Add endpoint for removing connections
* Add endpoint for listing available boards to connect to
* Add endpoint for adding connections
* Optimized authorization around connections and statistics
* Updated core-node-sql to v0.15.12

### 0.1.7

* Update metronic version to 0.2.5
* Add autohost-memwatch for improved profiling
* Update package name and dependencies
* Update changelog (partly to trigger a build due to repo name change)
* Use correct @lk package names :finnadie:
* Correct where the memwatch module was being added and configured.
* Add endpoint to retrieve current user (related to multiboard epic)
* Updated call to match new updateBoardRoles signature
* Update @lk/node-data-access

### 0.1.6
Bug fix - correct configuration issues with metronic causing memory leak

### 0.1.5

Update to node-data-access version (0.14.6) to get latest seriate (0.5.1) / mssql (2.1.8) / tedious (1.12.2) stack.

### 0.1.4

Update node-data-access version dependency to get bug fix related to reporting the correct label, "No Access" instead of "None".

### 0.1.3

 * Update to new node-data-access (0.14.3) / seriate (0.5.0)
 * Update API calls to match new data format for board roles call

### 0.1.2

 * Fixed issue preventing new board roles from being inserted with boardRoleId: 0
 * Updated Node version in Dockerfile
 * Updated README Generation to support arrays configuration values

### 0.1.1

 * Added health check endpoint
