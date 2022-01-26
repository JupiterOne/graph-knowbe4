# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.2.1] - 2022-01-26

- Updated error handling around rate limiting. Users who run into 429s will now
  be informed via the error message to reduce their Polling Interval to a daily
  cadence.

## [2.2.0] - 2021-11-26

### Added

- Added support for ingesting the following **new** resources:

| Resources                              | Entity `_type`                          | Entity `_class` |
| -------------------------------------- | --------------------------------------- | --------------- |
| KnowBe4 Phishing Security Test Results | `knowbe4_phishing_security_test_result` | `Record`        |

- Added support for ingesting the following **new** relationships:

| Source Entity `_type`            | Relationship `_class` | Target Entity `_type`                   |
| -------------------------------- | --------------------- | --------------------------------------- |
| `knowbe4_phishing_security_test` | **CONTAINS**          | `knowbe4_phishing_security_test_result` |
| `knowbe4_user`                   | **HAS**               | `knowbe4_phishing_security_test_result` |

## [2.1.3] - 2021-11-18

### Changed

- Import `@jupiterone/integration-sdk-core` from `peerDependencies`

## [2.1.2] - 2021-11-11

## Fixed

- Fixed pagination logic for subsequent pages

## [2.1.1] - 2021-11-10

## Fixed

- Fetch data in larger batches to prevent API rate limiting

## [2.1.0] - 2021-11-03

### Added

- Added support for ingesting the following **new** resources:

| Resources                      | Entity `_type`                   | Entity `_class` |
| ------------------------------ | -------------------------------- | --------------- |
| KnowBe4 Phishing Campaign      | `knowbe4_phishing_campaign`      | `Training`      |
| KnowBe4 Phishing Security Test | `knowbe4_phishing_security_test` | `Assessment`    |

- Added support for ingesting the following **new** relationships:

| Source Entity `_type`       | Relationship `_class` | Target Entity `_type`            |
| --------------------------- | --------------------- | -------------------------------- |
| `knowbe4_account`           | **HAS**               | `knowbe4_phishing_campaign`      |
| `knowbe4_account`           | **HAS**               | `training_campaign`              |
| `knowbe4_phishing_campaign` | **CONTAINS**          | `knowbe4_phishing_security_test` |

## [2.0.4] - 2021-10-29

## Fixed

- Error handler during fetch now accounts for 4xx and 5xx errors better, and
  waits longer during the retry

- Handle `undefined` properties on training campaigns that was prevent the full
  set of `phishing_campaign` entities from being ingested

## [2.0.3] - 2021-08-16

### Fixed

- Repeated entries for training modules no longer cause crash.
- Invalid users or modules listed in enrollments no longer cause crash.
- Users with undefined or null groups property no longer cause crash.

## [2.0.2] - 2021-08-11

### Fixed

- Null users returned from certain KnowBe4 API calls no longer cause crash.
- Logs no longer incorrectly report all fetch errors as rate-limiting errors.
- Non-rate-limiting errors no longer invoke backoff-retry function.

## Updated

- Package versions.

## [2.0.1] - 2021-08-04

### Changed

- Rewrite of the integration to utilize new SDK.
