const stripe = require('stripe')('sk_test_nehQ16RVy8FjjBTDnKPNvpSP');

const test = async () => {
  try {
    const newAcct = await stripe.accounts.create({
      type: 'standard',
      country: 'US',
      email: 'a1s2d3f4g5g6@1a2s3d.com'
    });
    console.log(newAcct);
  } catch (error) {
    console.error(error);
  }
};

test();

const res = {
  id: 'acct_1C2wWrBZtnKp8ksY',
  object: 'account',
  business_logo: null,
  business_name: null,
  business_url: null,
  charges_enabled: true,
  country: 'US',
  default_currency: 'usd',
  details_submitted: false,
  display_name: null,
  email: 'a1s2d3f4g5g6@1a2s3d.com',
  keys: {
    secret: 'sk_test_0JiPC5gqdrtPKjon8u07slQd',
    publishable: 'pk_test_gbLTiG4Zj0yJPBahU2QANXzq'
  },
  metadata: {},
  payouts_enabled: false,
  statement_descriptor: '',
  support_email: null,
  support_phone: null,
  timezone: 'Etc/UTC',
  type: 'standard'
};
