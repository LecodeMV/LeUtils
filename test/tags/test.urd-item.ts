interface Option {
    context?: any;
    param?: string;
}
export namespace ITestItem {
    export interface My_tag {
        readonly nbr: (option?: Option) => Promise<number>;
        readonly str: (option?: Option) => Promise<string>;
        readonly list: (option?: Option) => Promise<string[]>;
        readonly obj: (option?: Option) => Promise<{
            [key: string]: string;
        }>;
    }
}
export class TestItem {
    readonly my_tag: (option?: Option) => Promise<ITestItem.My_tag>;
}
export interface TestItemProps {
    'my_tag': Promise<ITestItem.My_tag>;
    'my_tag.nbr': Promise<number>;
    'my_tag.str': Promise<string>;
    'my_tag.list': Promise<string[]>;
    'my_tag.obj': Promise<{
        [key: string]: string;
    }>;
}
