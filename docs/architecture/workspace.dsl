workspace {
  model {
    user = person "User" {
      description "The person whose transcations are being tracked in this deployment of the system"
    }

    cronJob = person "Cron Job" {
      description "Cron job that runs every morning at 6AM"
    }

    tracker = softwareSystem "Transaction Tracker" {
      description "A command-line interface for tracking financial transactions"

      commanderContainer = container "Commander" {
        commander = component "Commander" {
          description "Interprets user commands and coordinates the flow of data between components"
        }
      }

      lib = container "Library" {
        description "Terminal CLI"
        
        pushbullet = component "Pushbullet Connector" {
          description "Connects to Pushbullet for sending notifications to the user's devices"
        }
        plaid = component "Plaid Connector" {
          description "Integrates with the Plaid API to retrieve transaction data from various banks"
        }
        splitwise = component "Splitwise Connector" {
          description "Connects to Splitwise to retrieve shared expenses"
        }
        printer = component "Transaction Printer" {
          description "Formats and prints the transaction data in a user-friendly CLI table"
        }
        date = component "Date Cycle Detector" {
          description "Detects the date range for transactions to be retrieved, focusing on the cycle that today is in"
        }
        databaseConnector = component "Database Connector" {
          description "Stores transaction data locally for quick access and manipulation"
        }
        filter = component "Transaction Filter" {
          description "Filters transactions based on configuration that specify transactions and patterns to ignore. It also provides a user-friendly interface to ignore transactions"
        }
        retriever = component "Transaction Retriever" {
          description "Retrieves transactions from the database and external APIs"
        }
        calculator = component "Expenses Calculator" {
          description "Collects transactions for the current cycle and returns them with a net total balance"
        }
        saver = component "Transaction Saver" {
          description "Saves new and updated transactions for historical record"
        }
        config = component "Configuration manager" {
          description "Adds/Updates environment variables"
        }

        commander -> pushbullet "Commands sending notification"
        commander -> printer "Commands printing of transactions in the CLI"
        commander -> date "Requests cycle that today is in"
        commander -> calculator "Requests expenses and balance"
        commander -> filter "Configures"
        commander -> saver "Saves transactions"
        saver -> retriever "Retrieves transactions"
        calculator -> splitwise "Retrieve debt"
        calculator -> retriever "Retrieves transactions"
        retriever -> databaseConnector "Retrieves transactions from storage"
        retriever -> plaid "Retrieves transactions from banks"
        filter -> databaseConnector "Saves/Retrieves configuration"
        filter -> plaid "Retrieves transactions from banks"
        filter -> date "Requests cycle that today is in"
        splitwise -> config "Retrieves splitwise credentials"
        pushbullet -> config "Retrieves pushbullet credentials"
        plaid -> config "Retrieves plaid & bank credentials"
      }

      webApp = container "Web Application" {
        description "Web application that includes a library of components as the CLI"

        payments = component "Payments Table" {
          description "Displays payments in a tabular format"
        }

        splitwiseCheckbox = component "Splitwise Checkbox" {
          description "Toggles the integration of transactions with Splitwise, enabling selective recording of shared expenses"
        }

        ignore = component "Ignore Button" {
          description "Ignores payment when in table and when calculating the total"
        }

        refresh = component "Refresh Button" {
          description "Reloads payments data from Plaid from"
        }

        api = component "API Service" {
          description "Webhook to reload payments data from Plaid"
        }

        cache = component "Payments Cache" {
          description "Caches the payments data to avoid repetetive API calls"
        }

        admin = component "Admin Page" {
          description "Displays and configures user credentials"
        }

        payments -> splitwiseCheckbox "Includes"
        payments -> ignore "Includes"
        payments -> cache "Reads the payments list"
        splitwiseCheckbox -> databaseConnector "Reads/Updates the transaction splitting information"
        refresh -> cache "Triggers cache refresh"
        ignore -> cache "Triggers cache refresh"
        ignore -> filter "Configures"
        api -> cache "Trigger cache refresh"
        cache -> calculator "Retrieves payments data"
        admin -> config "Retrieves and sets credentials"
      }
    }
    
    user -> commander "Requests table of transactions in the current cycle"
    user -> commander "Ignore certain transactions"
    user -> commander "Show ignored transactions"
    user -> commander "Reset ignored transactions"
    user -> commander "Save transactions in csv"
    user -> commander "Re-sign in to (and update the stored credentials for) a certain bank"
    user -> refresh "Request reloading of payments"
    cronJob -> commander "Send notification to user"
    commander -> api "Refreshes and retrieves balance"
  }
  views {
    systemContext tracker "TrackerArchitecture" {
      include *
    }
    component lib {
        include *
        autoLayout tb
    }
    component webApp {
        include *
        autoLayout tb
    }
    theme default
  }
  configuration {
    scope softwaresystem
  }
}
