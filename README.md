# Premote

[Javascript Remoting](http://www.salesforce.com/us/developer/docs/pages/Content/pages_js_remoting.htm) in Visualforce has an ugly api. **Premote** fixes this by letting you wrap your Remote Action calls in a promise based on [Q](https://github.com/kriskowal/q).

## Requirements

To use Premote, you need to be using [Q](https://github.com/kriskowal/q).

## Installing

* Include **Q** on your page in a `<script>` tag
* Include **Premote** on your page using a `<script>` tag

## Usage

You simply use Premote's `wrap()` function to turn any Remote action function into function that returns a Q promise. Here is the basic usage:

```js
var getAccount = Premote.wrap('MyController.getAccount');

getAccount(accountId)
  .then(function(account) {
    console.log('got the account: ' + account.Name);
  })
  .fail(function(error){
    console.error(error.message);
  });
```

Here is the example controller and Apex method we are calling:

```java
global class MyController {

  @RemoteAction
  global static Account getAccount(String accountId) {
    List<Account> accs = [SELECT Id, Name, Industry from Account WHERE Id = :accountId LIMIT 1];
    if(accs.size() == 1) {
        return accs.get(0);
    }
    return null;
  }

}
```

You can also wrap your Remote Action function calls with Visualforce Remoting options.

```js
var getAccount = Premote.wrap('MyController.getAccount', { escape: true, timeout: 10000 });
```

Remember that Visualforce has tags to output the fully-qualified remote action name (including namespace):

```js
var getAccount = Premote.wrap('{!$RemoteAction.MyController.getAccount}');
```

## Advanced Examples

Say you have two Remote Actions, one to create an Account and one to create a Contact and you need to create an Account with multiple Contacts associated to it.

Doing this requires that the Account is created first so you can get the AccountId. Only after the Account is created can you create the Contacts because you need the AccountId to be able to associate them.

Since our `createContact` function only creates one contact at a time, it would be nice if we could create the Account, then create the Contacts in parallel http requests, then resolve a single promise back to the user.

Here is a how you would compose a single function to do all of that:

```js
var createAccount = Premote.wrap('MyController.createAccount');
var createContact = Premote.wrap('MyController.createContact');

function createAccountWithContacts(account, contacts) {
  // create the account first
  return createAccount(account)
    // create the contacts in parallel
    .then(function(acc) { 
      var promises = [];
      contacts.forEach(function(con) {
        con.AccountId = acc.Id;
        promises.push(createContact(con));
      });
      return Q.all(promises);
    });
};
```

Now we can use it:

```js
var account = { Name: 'ABC Company', Industry: 'Manufacturing'};

var contacts = [
  { FirstName: 'Johnny', LastName: 'Dough', Email: 'jd@test.com' },
  { FirstName: 'Bobby', LastName: 'Tester', Email: 'bt@test.com' }
];

createAccountWithContacts(account, contacts)
  .then(function(){
    console.log('account and contacts created');
  })
  .fail(function(){
    console.error('an error occurred');
  });
```

## Benefits

The main benefit is that **Premote** allows you to use true promises to manage asynchronous flow control when invoking Javascript Remote Action. If you aren't familiar with promises, I highly recommend you read the documentation from the [Q](https://github.com/kriskowal/q) README.