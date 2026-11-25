/**
 * Recursively converts BigInt values to strings for safe JSON serialization.
 * Use this instead of patching BigInt.prototype.toJSON globally.
 */
export function serializeBigInt<T>(data: T): T {
    return JSON.parse(
        JSON.stringify(data, (_key, value) =>
            typeof value === "bigint" ? value.toString() : value
        )
    );
}
