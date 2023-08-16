# Transaction Tracker

This is a Node.js application that connects to the Plaid API and retrieves transactions from multiple accounts. It then categorizes the transactions and displays them in a readable format.

Note that the application is currently customized to work with my Amex and Tangerine accounts.

## Installation

1. Clone this repository.
1. Run `yarn install` to install the dependencies.

## Configuration

Check out the _.env.sample_

## Usage

Check out the package.json scripts:

- `yarn show`: retrieves transactions from the current pay cycle and displays them in a table.
- `yarn save`: saves all the transactions from the last few months in csv files inside a _data/_ directory
  - Each sub-directory represents an account
  - Each file in a sub-directory represents one month
- `yarn send`: sends the total transactions in the current pay cycle as a phone notification via pushbullet (configured by env variables)
- `yarn ignore`: ignores certain transactions when displaying or calculating transaction totals

Note: To customize the pay cycle or the date range for which transactions are displayed, the `getCycleDates` function can be modified in the _./utils/get-transactions.ts_ file.

### Required Configuration Files

To ignore transactions, the following files are used:

- _./db.td.ids_: comma-separated TD transaction IDs to be ignored. You can create that file using the `ignore-transactions` script.
- _./db.td.names_: comma-separated TD transaction names to be ignored.
- _./db.tangerine.names_: comma-separated Tangerine transaction names to be ignored.
- _./db.amex.names_: comma-separated Amex transaction names to be ignored.

## Setting up Plaid

Transaction tracker utilizes [plaid](https://plaid.com/) to get the transactions. Hence, users must set up the service and obtain credentials before being able to use this package.

### Get Access Token for Your Bank Account

1. Once you create a [Plaid](https://dashboard.plaid.com/overview) account, set the `CLIENT_ID` and `SECRET` in your .env file
1. Run the `createLinkToken` function in _create-link.ts_ and get the outputted token
1. Put this token in the _create-link.html_ file and render the file in a browser
1. Open the console log in the browser
1. Enter your credentials for your desired bank account and wait to get the public token in the console log
1. Use that token as a parameter for `getAccessToken` (in _create-link.ts_) to run it and get the access token

You can now set that token in the .env file and run `yarn start`
