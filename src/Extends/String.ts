
export type StringHandler = ReturnType<typeof handler>;

export default function handler(string: string) {
    return {
        regexValue(pattern: RegExp) {
            if (string.match(pattern)) return RegExp.$1;
            return null;
        }
    };
}
