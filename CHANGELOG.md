# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
