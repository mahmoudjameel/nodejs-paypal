const express = require("express");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");

const app = express();

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

paypal.configure({
  mode: "live", //sandbox or live
  client_id: "AaRtPGhA-MCeCwtXLieEySCSYFBP_fPYqAeIZtyHyRWj-xp4GOGrEW8n-7PMcjc2M3PWtz-dmPzTvIRj",
  client_secret: "ENSA1MU-PaNoMT1bozWU-1j3GTqjcVhc6MSrG4jySvWJjF3fQOhdMmQ-2NP4_itk5Zj3crwY8B4Y_mRq",
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/paypal", (req, res) => {
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `https://soccer-challenge-app.herokuapp.com/success?amount=${req.query.amount}`,
      cancel_url: "https://soccer-challenge-app.herokuapp.com/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: req.query.item,
              sku: req.query.item,
              price: req.query.amount,
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: req.query.amount,
        },
        description: "This is the payment description.",
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      console.log("Create Payment Response");
      console.log(payment);
      res.redirect(payment.links[1].href);
    }
  });
});

app.get("/success", (req, res) => {
  // res.send("Success");
  var PayerID = req.query.PayerID;
  var paymentId = req.query.paymentId;
  var execute_payment_json = {
    payer_id: PayerID,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: req.query.amount,
        },
      },
    ],
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      res.render("cancel");
      throw error;
    } else {
      console.log("Get Payment Response");
      console.log(JSON.stringify(payment));
      res.render("success");
    }
  });
});

app.get("cancel", (req, res) => {
  res.render("cancel");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running");
});
