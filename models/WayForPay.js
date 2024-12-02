const crypto = require('crypto');
const axios = require('axios');
/**
 * WayForPay payment module
 * @param {Object} - account name in WayForPay, secret key, API url, serviceUrl, returnUrl
 */
module.exports = ({
  account, secret, apiUrl, serviceUrl = null, returnUrl = null
}) => ({
  createSignature(string) {
    return crypto.createHmac('md5', secret).update(string).digest('hex');
  },
  createStringForSignature(arr) {
    return arr.join(';');
  },
  productData(items, k) {
    return items.map((i) => i[k]);
  },

  prepareFields(order) {
    const {
      id, 
      items, 
      amount, 
      currency, 
      domain,
      serviceUrl, 
      returnUrl,
      clientFirstName,
      clientLastName,
      clientEmail,
      clientPhone
    } = order;

    return {
      merchantAccount: account,
      orderReference: id.toString(),
      orderDate: Date.now(),
      amount,
      productName: items.map(i => i.product_name),
      productPrice: items.map(i => i.price),
      productCount: items.map(i => i.count),
      clientFirstName: clientFirstName,
      clientLastName: clientLastName,
      clientEmail: clientEmail,
      clientPhone:clientPhone,
      items,
      currency,
      merchantDomainName: domain,
      serviceUrl: serviceUrl,
      returnUrl,
      deliveryList: 'nova;ukrpost'
    };
  },
  
  prepareOrderRequest(order) {
    const signature = this.createSignature(this.createStringForSignature([
      order.merchantAccount,
      order.merchantDomainName,
      order.orderReference,
      order.orderDate,
      order.amount,
      order.currency,
      ...this.productData(order.items, 'product_name'),
      ...this.productData(order.items, 'count'),
      ...this.productData(order.items, 'price')
    ]));

    return {
      ...order,
      transactionType: 'CREATE_INVOICE',
      merchantAuthType: 'SimpleSignature',
      merchantSignature: signature,
      apiVersion: 1,
      language: 'UA',
      paymentSystems:'googlePay;applePay;card'
    };
  },
  prepareTransactionsRequest(timestamp, hours) {
    const signature = this.createSignature(this.createStringForSignature([
      account,
      timestamp - hours * 60 * 60,
      timestamp
    ]));

    return {
      apiVersion: 1,
      transactionType: 'TRANSACTION_LIST',
      merchantAccount: account,
      merchantSignature: signature,
      dateBegin: timestamp - hours * 60 * 60,
      dateEnd: timestamp
    };
  },
  transactionReceived(order, status) {
    const time = Date.now();
    const string = this.createStringForSignature([
      order,
      status,
      time
    ]);
    const signature = this.createSignature(string);
    const requestData = {
      orderReference: order,
      status,
      time: time,
      signature
    };

    return requestData;
  },
  async prepareInvoice(order) {
    const orderData = this.prepareFields(order);
    const requestData = this.prepareOrderRequest(orderData);
    const result = await axios.post(apiUrl, requestData);

    return result;
  },
  async getTransactions(timestamp, hours = 24) {
    const requestData = this.prepareTransactionsRequest(timestamp, hours);
    const result = await axios.post(apiUrl, requestData);

    return result;
  }
});