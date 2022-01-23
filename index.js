const secret = process.env['BOT_CONSUMER_SECRET']; // ADD this only using environment variables
const key = process.env['BOT_CONSUMER_KEY']; // // ADD this only using environment variables
const currentURL = "https://twitter-login.therohitdas.repl.co" // Example - https://twitter-login.therohitdas.repl.co


const express = require('express');
const LoginWithTwitter = require('login-with-twitter');
var session = require('express-session');

const app = express()
const port = 80

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'does not matter',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

app.get('/', (req, res) => {
  if (req.session.user) res.send(req.session.user);
  else res.sendFile("index.html", {root: __dirname });
})

const tw = new LoginWithTwitter({
  consumerKey: key,
  consumerSecret: secret,
  callbackUrl: currentURL + '/twitter/callback'
})

app.get('/twitter', (req, res) => {
  tw.login((err, tokenSecret, url) => {
    if (err) {
      console.error(err)
    }
    
    // Save the OAuth token secret for use in your /twitter/callback route
    req.session.tokenSecret = tokenSecret
    
    // Redirect to the /twitter/callback route, with the OAuth responses as query params
    res.redirect(url)
  })
})


app.get('/twitter/callback', (req, res) => {
  tw.callback({
    oauth_token: req.query.oauth_token,
    oauth_verifier: req.query.oauth_verifier
  }, req.session.tokenSecret, (err, user) => {
    if (err) {
      console.error(err)
    }
    
    // Delete the tokenSecret securely
    delete req.session.tokenSecret
    
    console.log(user);
	
    req.session.user = user
    
    // Redirect to whatever route that can handle your new Twitter login user details!
    res.redirect('/')
  });
});

app.get('/twitter-url-settings.png', (req, res) => {
	res.sendFile("twitter-url-settings.png", {root: __dirname })
});

app.listen(port, () => {
  console.log(`App listening at <current-project-name>.<your-username>.repl.co`)
})
