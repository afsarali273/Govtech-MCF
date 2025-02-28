Feature: API and UI functionalities for managing working class heroes and vouchers

  Scenario: Creating a working class hero via API
    Given I send a request to create a working class hero
    Then a new working class hero should be created

  Scenario: Uploading a CSV file to populate the database
    Given I am logged in as a Clerk
    When I upload a CSV file through the portal
    Then the database should be populated with the data from the CSV file

  Scenario: Generating a Tax Relief Egress File from the UI
    Given I am logged in as a Book Keeper
    When I generate a Tax Relief Egress File from the UI
    Then the system should generate and provide the Tax Relief Egress File

  Scenario: Creating a working class hero with vouchers via API
    Given I send a request to create a working class hero with vouchers
    Then a new working class hero with vouchers should be created

  Scenario: Checking if a working class hero owes money via external API
    Given I send a request to check if a working class hero owes money
    When the external service responds with the owed amount
    Then I should receive the information whether the working class hero owes money

  Scenario: Retrieving the number of vouchers each customer has for each category
    Given I send a request to retrieve the voucher count for a customer
    Then the system should return the number of vouchers each customer has for each voucher category
