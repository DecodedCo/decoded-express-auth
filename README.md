# express-auth0-simple
Simple authentication middleware for integrating Auth0 with Express-based applications.

## About
This NodeJS package abstracts away the boilerplate code needed to integrate a NodeJS web application with the oauth authentication provider [Auth0](https://auth0.com/).
The code is based on Auth0's own setup guide and should work fine with any application using versions of the Express framework in the **4.x.x** version range.

## Setup
Here is a quickstart guide on how to setup this middleware.

### Install Package

Run this command within an existing node project with a `package.json` file to install the package as a dependency of your project.

```sh
npm install --save express-auth0-simple
```

> **Pro Tip:** Omit the `--save` option if you just want to install the package without adding it as a dependency.

Or alternatively, add this line to the `dependencies` section of your `package.json` file:

```json
"express-auth0-simple": "^3.0.0"
```

### Use Package

Having installed the package and/or added it as a dependency to your project, you'll now need to add the following lines to the main file of your app:

```js
// You'll probably want to require() other dependencies like express first, above this line...

var expressAuth0Simple = require('express-auth0-simple'); // Import the middleware library

// inititalise an instance of decoded auth
var auth = new expressAuth0Simple(app); // Pass in your express app instance here
```

Use the `requiresLogin` middleware method of your auth instance whenever you have one or more URL routes you want to be protected behind Auth0 authentication. Attempting to access any of the routes using this middleware will redirect the user to Auth0 to login first before allowing them to continue:

```js
// Any URL route defined after this point will require authentication
app.use(auth.requiresLogin);
```

OR:

```js
// Here it is used as a per-route middleware to protect only this URL route
app.get('/my-fab-route', auth.requiresLogin, function(req,res) {
  res.send('My route rocks! 🐸 💜');
})
```

## Configuration

### Environment Variables

So that your app can authenticate with Auth0, you'll need to provide your Auth0 account credentials. You need to provide your **Auth0 Client ID**, your **Auth0 Client Secret** and your **Auth0 Domain**. These values differ from app to app and you can find the values for your app in its settings page in the dashboard.

The easiest secure way of supplying these credentials to your app is via environment variables and this package will do that by default. Make sure the following environment variables have been set and are accessible to the process running the app:

```sh
export AUTH0_CLIENT_ID='your_client_id';
export AUTH0_CLIENT_SECRET='your_client_secret';
export AUTH0_DOMAIN='companyltd.eu.auth0.com';
```

You can also set these values via the options argument when initialising the middleware, but if you are doing this, it is _highly recommended_ that these are not stored in source code.

### Options Object

When initialising the middleware, you can optionally provide a second argument to the `expressAuth0Simple()` constructor - this should be an object. This can include options that override some configuration parameters of the middleware.

The options are:

| Key                      | Type                               | Default Value    | Description                                                                                                                                                                  |
| ------------------------ | ---------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth0`                  | **Object**                         |                  | Defines options that are passed directly into `passport-auth0`, these are described below                                                                                    |
| `auth0.domain`           | **String**                         |                  | The domain configured in your Auth0 Dashboard (Normally in the format `<domain>.<region>.auth0.com`)                                                                         |
| `auth0.clientID`         | **String**                         |                  | Client ID as shown in your Auth0 Dashboard                                                                                                                                   |
| `auth0.clientSecret`     | **String**                         |                  | Client Secret as shown in your Auth0 Dashboard                                                                                                                               |
| `auth0.callbackURL`      | **String**                         | `/auth/callback` | URL that your application uses to receive the OAuth callback from Auth0. This library will create an express route at that URL for you (Must match value in Auth0 Dashboard) |
| `cookieSecret`           | **String** OR **Array of Strings** | _random UUID_    | See https://github.com/expressjs/session#secret for more info (This is set to a random UUID by default and should normally not need changing)                                |
| `successRedirect`        | **String**                         | `/`              | A URL to redirect to on successful Authentication                                                                                                                            |
| `failureRedirect`        | **String**                         | `/auth/failed`   | A URL to redirect to on failed Authentication                                                                                                                                |
| `serializeUser`          | **Function**                       | `null`           | A function to use for serialising users (see [passportjs documentation](http://passportjs.org/docs/configure))                                                               |
| `deserializeUser`        | **Function**                       | `null`           | A function to use for deserialising users (see [passportjs documentation](http://passportjs.org/docs/configure))                                                             |
| `useDefaultFailureRoute` | **Boolean**                        | `true`           | Whether the library should automatically provide a failure route handler or not                                                                                              |

Shown here is a full options object with every key populated, but note that each key is optional and will take the default for that argument if not given (many of the default values are recommended over the values provided below, which are just for demonstration).

```js
var options = {
  auth0: {
    domain: 'yourdomain.eu.auth0.com',
    clientID: 'client_id_super_secret',
    clientSecret: 'client_secret_super_super_secret!',
    callbackURL: '/callback'
  },
  cookieSecret: 'cookiesRkuhl',
  successRedirect: '/',
  failureRedirect: '/auth-fail',
  useDefaultFailureRoute: true
}
```
