# KnowBe4

## Overview

JupiterOne provides a managed integration with KnowBe4. The integration connects
directly to KnowBe4 APIs to obtain account metadata and analyze resource
relationships. You authorize access by providing that an API token.

## Integration Instance Configuration

The integration is triggered by an event containing the information for a
specific integration instance.

## Entities

The following entity resources are ingested when the integration runs:

| Example Entity Resource | \_type : \_class of the Entity     |
| ----------------------- | ---------------------------------- |
| Account                 | `knowbe4_account` : `Account`      |
| User                    | `knowbe4_user` : `User`            |
| User Group              | `knowbe4_user_group` : `UserGroup` |

## Relationships

The following relationships are created/mapped:

| From                 | Edge    | To                   |
| -------------------- | ------- | -------------------- |
| `knowbe4_account`    | **HAS** | `knowbe4_user`       |
| `knowbe4_account`    | **HAS** | `knowbe4_user_group` |
| `knowbe4_user_group` | **HAS** | `knowbe4_user`       |
