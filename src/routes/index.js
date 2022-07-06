"use strict"

require("../services/passport")
const passport = require("passport")
const getBaseResponse = require("../lib/rest_response")
const requireAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    let response = getBaseResponse()
    if (err) {
      console.log('the user is', user);
      response.success = false
      response.errors.push(err.message || err)
    } else if (!user) {
      console.log('the user is',user);
      response.success = false
      response.errors.push("User not Found")
    }

    if (!response.success) return res.json(response)
    req.user = user
    next()
  })(req, res, next)
}
const baseRoutes = require("./base")(requireAuth)
const apiRoutes = require("./api")(requireAuth)
const authRoutes = require("./auth")(passport)

let apiPrepend
switch (process.env.NODE_ENV) {
  case "development":
    apiPrepend = "dev"
    break
  case "mind-spa-staging":
    apiPrepend = "stage"
    break
  case "mind-spa-testing":
    apiPrepend = "test"
    break
  default:
    apiPrepend = "dev"
}

module.exports = app => {
  // Start of Application logic Routes
  app.use(`/${apiPrepend}/auth`, authRoutes)
  app.use(`/${apiPrepend}/api`, apiRoutes)
  app.use(`/${apiPrepend}`, baseRoutes)

  // End of Application logic Routes

  // Random request _ handle page not found error _ 404
  app.use((req, res) => {
    // respond with html page
    if (req.accepts("html")) {
      //res.redirect('/');
      return
    }

    // respond with json
    if (req.accepts("json")) {
      res.status(404).send({ error: "Not found" })
      return
    }

    // default to plain-text. send()
    res.status(404).type("txt").send("Not found")
  })

  // error handler
  // no stacktraces leaked to user unless in development environment
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render("error", {
      message: err.message,
      error: app.get("env") === "development" ? err : {},
    })
  })
}
