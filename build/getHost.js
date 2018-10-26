/**
 * @file 获取主机地址
 * @author luwenlong
 */

function getHost() {
    var ifaces = require( 'os' ).networkInterfaces();
    var ip = '127.0.0.1';

    function x( details ) {
        if (details.family === 'IPv4' && /^(192|193)\./g.test(details.address)) {
            ip = details.address;
        }
    }

    for ( var dev in ifaces ) {
        ifaces[ dev ].forEach( x );
    }

    return ip;
}

module.exports = getHost()
