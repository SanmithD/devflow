export interface Tool {
    name: string;
    description: string;
    execute: (input: string) => Promise<string | any> | null;
}