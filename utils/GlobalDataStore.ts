class GlobalDataStore {
    private static data: Map<string, any> = new Map();

    public static set<T>(key: string, value: T): void {
        this.data.set(key, value);
    }

    public static get<T>(key: string): T | undefined {
        return this.data.get(key);
    }

    public static clear(): void {
        this.data.clear();
    }

    public static has(key: string): boolean {
        return this.data.has(key);
    }
}

export default GlobalDataStore;
