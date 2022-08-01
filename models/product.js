function ProductType(type) {
    this.value = type;
    this.label = ProductType.TYPE_STRINGS[type];
}
ProductType.TYPE_STRINGS = {
    'topup': 'Airtime',
    'pin': 'PIN',
    'data': 'DATA',
    'billpay': 'BillPay',
    'ft': 'Fund Transfer',
    'other': 'Other',
    'sms': 'SMS'
}

function Product(data) {
    Object.assign(this, data);
    this.type = new ProductType(this.type);
}
