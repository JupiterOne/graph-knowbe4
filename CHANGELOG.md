# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Null users returned from certain KnowBe4 API calls no longer cause crash.
- Logs no longer incorrectly report all fetch errors as rate-limiting errors.
- Non-rate-limiting errors no longer invoke backoff-retry function.

## Updated

- Package versions.

## 2.0.0 - 2021-08-04

### Changed

- Rewrite of the integration to utilize new SDK.
