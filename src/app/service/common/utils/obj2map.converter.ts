export class Obj2MapConverter {
    public static do<K, V>(obj: Object): Map<string, V> {
        let map: Map<string, V> = new Map();

        Object.keys(obj).forEach((key) => {
            map.set(key, obj[key]);
        });

        return map;
    }
}