#include <iostream>
using namespace std;

// Maximum number of accounts
const int MAX_ACCOUNTS = 100;

// Structure to store account details
struct Account {
    int accountNumber;
    char accountHolder[50];
    double balance;
};

// Global variables
Account accounts[MAX_ACCOUNTS];
int totalAccounts = 0;
int nextAccountNumber = 1001;

// Function declarations
void createAccount();
void depositCash();
void withdrawCash();
void displayAccount();
void displayAllAccounts();
void showMenu();

int main() {
    int choice;
    do {
        showMenu();
        cout << "Enter your choice: ";
        cin >> choice;

        switch(choice) {
            case 1:
                createAccount();
                break;
            case 2:
                depositCash();
                break;
            case 3:
                withdrawCash();
                break;
            case 4:
                displayAccount();
                break;
            case 5:
                displayAllAccounts();
                break;
            case 0:
                cout << "Exiting the application. Thank you!\n";
                break;
            default:
                cout << "Invalid choice. Please try again.\n";
        }
        cout << "\n";
    } while(choice != 0);

    return 0;
}

// Function to display the menu
void showMenu() {
    cout << "\n===== Bank Application Menu =====\n";
    cout << "1. Create New Account\n";
    cout << "2. Cash Deposit\n";
    cout << "3. Cash Withdrawal\n";
    cout << "4. Display Account Information\n";
    cout << "5. Display All Accounts Information\n";
    cout << "0. Exit\n";
    cout << "==================================\n";
}

// Function to create a new account
void createAccount() {
    if (totalAccounts >= MAX_ACCOUNTS) {
        cout << "Cannot create more accounts!\n";
        return;
    }
    
    Account newAcc;
    newAcc.accountNumber = nextAccountNumber++;

    cout << "Enter account holder name: ";
    cin.ignore(); // Ignore leftover newline
    cin.getline(newAcc.accountHolder, 50);

    cout << "Enter initial deposit amount: ";
    cin >> newAcc.balance;

    accounts[totalAccounts++] = newAcc;
    cout << "Account created successfully! Your Account Number is: " << newAcc.accountNumber << "\n";
}

// Function to deposit cash
void depositCash() {
    int accNum;
    double amount;
    cout << "Enter account number: ";
    cin >> accNum;

    for (int i = 0; i < totalAccounts; i++) {
        if (accounts[i].accountNumber == accNum) {
            cout << "Enter deposit amount: ";
            cin >> amount;
            if (amount > 0) {
                accounts[i].balance += amount;
                cout << "Deposit successful! New balance: " << accounts[i].balance << "\n";
            } else {
                cout << "Invalid deposit amount!\n";
            }
            return;
        }
    }
    cout << "Account not found!\n";
}

// Function to withdraw cash
void withdrawCash() {
    int accNum;
    double amount;
    cout << "Enter account number: ";
    cin >> accNum;

    for (int i = 0; i < totalAccounts; i++) {
        if (accounts[i].accountNumber == accNum) {
            cout << "Enter withdrawal amount: ";
            cin >> amount;
            if (amount > 0 && amount <= accounts[i].balance) {
                accounts[i].balance -= amount;
                cout << "Withdrawal successful! New balance: " << accounts[i].balance << "\n";
            } else {
                cout << "Insufficient balance or invalid amount!\n";
            }
            return;
        }
    }
    cout << "Account not found!\n";
}

// Function to display account information
void displayAccount() {
    int accNum;
    cout << "Enter account number: ";
    cin >> accNum;

    for (int i = 0; i < totalAccounts; i++) {
        if (accounts[i].accountNumber == accNum) {
            cout << "\nAccount Number: " << accounts[i].accountNumber << "\n";
            cout << "Account Holder: " << accounts[i].accountHolder << "\n";
            cout << "Balance: " << accounts[i].balance << "\n";
            return;
        }
    }
    cout << "Account not found!\n";
}

// Function to display all accounts
void displayAllAccounts() {
    if (totalAccounts == 0) {
        cout << "No accounts available.\n";
        return;
    }

    for (int i = 0; i < totalAccounts; i++) {
        cout << "\nAccount Number: " << accounts[i].accountNumber << "\n";
        cout << "Account Holder: " << accounts[i].accountHolder << "\n";
        cout << "Balance: " << accounts[i].balance << "\n";
    }
}