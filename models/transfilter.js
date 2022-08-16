function AccountPaidTransFilter(transFlag, criteria) {
    this.transFlag = transFlag;
    this.criteria = criteria;
}

AccountPaidTransFilter.prototype.filter = function (statEntry) {
    var that = this;

    if(this.transFlag == 'country') {
        return statEntry.top10_accounts_paid.filter(function (e) {return e.country === that.criteria});
    } else if(this.transFlag == 'destination') {
        return statEntry.top10_accounts_paid.filter(function (e) {return (e.country + '-' + e.operator_name) === that.criteria});
    } else if(this.transFlag == 'provider') {
        return statEntry.top10_accounts_paid.filter(function (e) {return e.tag === that.criteria});
    } else if(this.transFlag == 'producttype') {
        return statEntry.top10_accounts_paid.filter(function (e) {return e.type === that.criteria});
    } else if(this.transFlag == 'agent') {
        return statEntry.top10_accounts_paid.filter(function (e) {return e._id === that.criteria});
    } else {
        if(that.criteria)
            return statEntry.top10_accounts_paid.filter(function (e) {return that.criteria.indexOf(e._id) != -1});
        else
            return statEntry.top10_accounts_paid
    }
}

function AccountTopupTransFilter(transFlag, criteria) {
    this.transFlag = transFlag;
    this.criteria = criteria;
}

AccountTopupTransFilter.prototype.filter = function (statEntry) {
    var that = this;

    if(this.transFlag == 'country') {
        return statEntry.top10_accounts_topup.filter(function (e) {return e.country === that.criteria});
    } else if(this.transFlag == 'destination') {
        return statEntry.top10_accounts_topup.filter(function (e) {return (e.country + '-' + e.operator_name) === that.criteria});
    } else if(this.transFlag == 'provider') {
        return statEntry.top10_accounts_topup.filter(function (e) {return e.tag === that.criteria});
    } else if(this.transFlag == 'producttype') {
        return statEntry.top10_accounts_topup.filter(function (e) {return e.type === that.criteria});
    } else if(this.transFlag == 'agent') {
        return statEntry.top10_accounts_topup.filter(function (e) {return e._id === that.criteria});
    } else {
        if(that.criteria)
            return statEntry.top10_accounts_topup.filter(function (e) {return that.criteria.indexOf(e._id) != -1});
        else
            return statEntry.top10_accounts_topup
    }
}

function CountryPaidTransFilter(transFlag, criteria, profile) {
    this.transFlag = transFlag;
    this.criteria = criteria;
    this.profile = profile;
}
CountryPaidTransFilter.prototype.filter = function(statEntry) {
    var that = this;
    if (statEntry.top10_countries_paid.length > 0)
        console.log("venus" + JSON.stringify(statEntry.top10_countries_paid[0]));
    if(this.transFlag == 'country') {
        return statEntry.top10_countries_paid.filter(function (e) {return e.country === that.criteria && (that.profile.access_level == "partner" ? (e.tag == that.profile.partner_tag) : true)});
    } else if(this.transFlag == 'destination') {
        return statEntry.top10_countries_paid.filter(function (e) {return (e.country + '-' + e.operator_name) === that.criteria && (that.profile.access_level == "partner" ? (e.tag == that.profile.partner_tag) : true)});
    } else if(this.transFlag == 'provider') {
        return statEntry.top10_countries_paid.filter(function (e) {return e.tag === that.criteria && (that.profile.access_level == "partner" ? (e.tag == that.profile.partner_tag) : true)});
    } else if(this.transFlag == 'producttype') {
        return statEntry.top10_countries_paid.filter(function (e) {return e.type === that.criteria && (that.profile.access_level == "partner" ? (e.tag == that.profile.partner_tag) : true)});
    } else {
        return statEntry.top10_countries_paid.filter(function (e) {return that.profile.access_level == "partner" ? (e.tag == that.profile.partner_tag) : true});
    }
}

function CountryTopupTransFilter(transFlag, criteria) {
    this.transFlag = transFlag;
    this.criteria = criteria;
}
CountryTopupTransFilter.prototype.filter = function(statEntry) {
    var that = this;
    
    if(this.transFlag == 'country') {
        return statEntry.top10_countries_topup.filter(function (e) {return e.country === that.criteria});
    } else if(this.transFlag == 'destination') {
        return statEntry.top10_countries_topup.filter(function (e) {return (e.country + '-' + e.operator_name) === that.criteria});
    } else if(this.transFlag == 'provider') {
        return statEntry.top10_countries_topup.filter(function (e) {return e.tag === that.criteria});
    } else if(this.transFlag == 'producttype') {
        return statEntry.top10_countries_topup.filter(function (e) {return e.type === that.criteria});
    } else {
        return statEntry.top10_countries_topup;
    }
}