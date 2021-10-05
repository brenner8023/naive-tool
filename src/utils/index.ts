
export function getJsonFromStr(str: string): [boolean, object] {
    try {
        let res = (new Function(`return ${str}`))();
        return [true, res];
    } catch (err) {

        // console.log(err);
        return [false, { data: 'invalid json' }];
    }
}

export function shallowCopy<T>(target: T): T {
    if (typeof target === 'object') {
        return Object.assign({}, target);
    }
    return target;
}

export function deepCopy<T>(target: T): T {
    try {
        return JSON.parse(JSON.stringify(target));
    } catch (err) {
        console.log(err);
        return target;
    }
}
