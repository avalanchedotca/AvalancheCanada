var moment   = require('moment-timezone');
var entities = require('entities');

var logger   = require('../../logger');
var config   = require('../../config/environment');

var IMAGE_PREFIX_USER =
    config.AC_MCR_HOST + '/content/styles/guide_view_guide_picture/public/';
var IMAGE_PREFIX_REPORT = config.AC_MCR_HOST + '/content/';

module.exports = {
    formatReportFull: formatReportFull,
    formatReport: formatReport,
    formatUser: formatUser,
};

function formatReportFull(report, user) {
    var r = formatReport(report);
    if (typeof r === 'undefined') return;
    r.user = formatUser(user);
    return r;
}

function formatUser(user) {
    return {
        id: Number.parseInt(user.uid),
        name: user.name,
        certs: f1(user, 'field_certifications', safeval),
        image: user.picture.url,
    };
}

function formatReport(r) {
    if (typeof(r.field_location) === 'undefined' || typeof(r.field_location.und) === 'undefined') {
        logger.info(
            'MCR - formatReport(report_id=%d) - Missing location, skipping',
            r.nid
        );
        return;
    }

    return {
        id: Number.parseInt(r.nid),
        location: [
            Number.parseFloat(r.field_location.und[0].lon),
            Number.parseFloat(r.field_location.und[0].lat),
        ],
        title: f1(r, 'title_field', no_entities),
        body: f1(r, 'body', safeval),
        permalink: r.path,
        dates: fall(r, 'field_date', getDate),
        images: fall(r, 'field_image', function(i) {
            return i.uri.replace('public://', IMAGE_PREFIX_REPORT);
        }),
        location_desc: f1(r, 'field_short_description', function(d) {
            return d.safe_value;
        }),
        groups: getGroups(r),
    };
}

function fall(r, key, trans) {
    if (typeof r[key] === 'undefined') return;
    if (typeof r[key].und === 'undefined') return;
    return r[key].und.map(trans);
}
function f1(r, key, trans) {
    var all = fall(r, key, trans);
    if (typeof all === 'undefined') return;
    if (all.length === 0) return;
    return all[0];
}

function no_entities(x) {
    var value = entities.decodeHTML(x.safe_value);
    logger.debug('decoding entities before="%s" after="%s"', x.safe_value, value);
    return value;
}
function safeval(x) {
    return x.safe_value;
}

function getDate(date) {
    var int_date = Number.parseInt(date.value);
    var dd = new Date(int_date * 1000);
    return moment.tz(dd, date.timezone).format();
}

function getGroups(r) {
    if (typeof r.og_groups === 'undefined') return [];
    return r.og_groups.map(function(gg) {
        return {
            name: gg.title,
            logo: f1(gg, 'field_logo', function(i) {
                return i.uri.replace('public://', IMAGE_PREFIX_REPORT);
            }),
        };
    });
}
