# Premote

Javascript Remoting in Visualforce has an ugly api. **Premote** fixes it by letting you wrap your Remote Action calls in a promise based on [Q](https://github.com/kriskowal/q).

## Requirements

To use Premote, you need to have [Q](https://github.com/kriskowal/q) imported on to your page.

## Installing

* Include **Q** on your page in a `<script>` tag
* Include **Premote** on your page using a script tag

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

You can also wrap your Remote Action function calls with Visualforce Remoting options.

```js
var getAccount = Premote.wrap('MyController.getAccount', { escape: true, timeout: 10000 });
```