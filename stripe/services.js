const stripe = require('stripe')('sk_test_nehQ16RVy8FjjBTDnKPNvpSP'); // (process.env.STRIPE_API_KEY)

module.exports = {
  createCustomer: async (email, token) => {
    try {
      const customer = await stripe.customers.create({
        email,
        source: token.token
      });
      return customer;
    } catch (error) {
      throw new Error(error);
    }
  }
};
