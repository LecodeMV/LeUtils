interface Option {
  context?: any;
  param?: string;
}

export namespace ITestItem {
  export interface My_tag {
    readonly nbr: (option?: Option) => Promise<number>;
    readonly nbrValues: Array<(option?: Option) => Promise<number>>;

    readonly str: (option?: Option) => Promise<string>;
    readonly strValues: Array<(option?: Option) => Promise<string>>;

    readonly list: (option?: Option) => Promise<string[]>;
    readonly listValues: Array<(option?: Option) => Promise<string[]>>;

    readonly obj: (option?: Option) => Promise<{[key: string]: string}>;
  }
}

export class TestItem {
  readonly my_tag: (option?: Option) => Promise<ITestItem.My_tag>;
  readonly my_tagValues: Array<(option?: Option) => Promise<ITestItem.My_tag>>;
}
