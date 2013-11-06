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

## Benefits

The main benefits here is that **Premote** allows you to use true promises to manage asynchronouse flow control. If you aren't familiar with promises, I highly recommend you read the documentation from the [Q](https://github.com/kriskowal/q) README.