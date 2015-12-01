/**
 * @module util.js
 * @author Joe Groseclose <@benderTheCrime>
 * @date 12/02/15
 */

const mm = (m, d) => m.replace('mm', d.getMonth() > 8 ?
        d.getMonth() + 1 : padZero(d.getMonth())
    ),
    dd = (m, d) => m.replace('dd', d.getDate() > 9 ?
        d.getDate() : padZero(d.getDate())
    ),
    yy = (m, d) => m.replace('yy', d.getFullYear().toString().substr(2, 3)),
    yyyy = (m, d) => m.replace('yyyy', d.getFullYear());


class DateUtil {
    static format(mask, d = new Date()) {
        if (!(d instanceof Date)) {
            d = new Date();
        }

        let str = mask;

        if (/dd/.test(mask)) {
            str = dd(str, d);
        }

        if (/mm/.test(mask)) {
            str = mm(str, d);
        }

        if (/yyyy/.test(mask)) {
            str = yyyy(str, d);
        }

        if (/yy/.test(mask)) {
            str = yy(str, d);
        }

        return str;
    }
}

function padZero(v) {
    return `0${v}`;
}

export { DateUtil as $DateUtil };