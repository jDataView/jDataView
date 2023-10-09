// We need to add all of these types as getXXX setXXX
// and writeXXX methods on the jDataView class.
// Various type acrobatics are needed to make this work.

type RegularTypes = {
	Float64: number;
	Float32: number;
	BigInt64: bigint;
	BigUint64: bigint;
	Int32: number;
	Uint32: number;
	Int16: number;
	Uint16: number;
	Int8: number;
	Uint8: number;
	Int64: number;
	Uint64: number;
	Bytes: ArrayLike<number>;
};

// These are the actual getXXX, setXXX, and writeXXX function definitions
type GetTypeFunction<T extends keyof RegularTypes> = (
	byteOffset?: number | undefined,
	littleEndian?: boolean | undefined
) => RegularTypes[T];
type SetTypeFunction<T extends keyof RegularTypes> = (
	byteOffset: number | undefined,
	value: RegularTypes[T],
	littleEndian?: boolean | undefined
) => void;
type WriteTypeFunction<T extends keyof RegularTypes> = (
	value: RegularTypes[T],
	arg3?: boolean | undefined
) => void;

// First off, each object type can only have one mapped type, so we
// have to do each in a separate object and then merge them all.
type GetSetWrite = {
	[T in keyof RegularTypes as `get${T}`]: GetTypeFunction<T>;
} & { [T in keyof RegularTypes as `set${T}`]: SetTypeFunction<T> } & {
	[T in keyof RegularTypes as `write${T}`]: WriteTypeFunction<T>;
};

// And then we need to use an interface to 'extend' the type, because
// interfaces can extend type but classes can't.
// Then, because the interface has the same name as the class, their
// types are automatically merged.
// Also we need to omit `getBytes` because just signature for the getter
// is different. The setter and writer are the same.
interface jDataView extends Omit<GetSetWrite, "getBytes"> {}

// Regular, non-cursed typescript from here on

type Bufferish = string | number | ArrayBuffer | ArrayLike<number>;

declare class jDataView implements DataView {
	readonly jDataView: jDataView;
	readonly buffer: ArrayBuffer;
	readonly byteOffset: number;
	readonly byteLength: number;
	readonly dataView: DataView;
	littleEndian: boolean;

	constructor(
		buffer: Bufferish,
		byteOffset?: number,
		byteLength?: number,
		littleEndian?: boolean
	);

	//  Needed to fully implement DataView
	get [Symbol.toStringTag](): string;

	// The `getBytes` method has an extra argument for specifying the byte length
	getBytes(
		length?: number,
		byteOffset?: number,
		littleEndian?: boolean
	): Uint8Array;

	// The string and char methods have unique signatures
	getString(
		byteLength?: number,
		byteOffset?: number,
		encoding?: string
	): string;
	setString(
		byteOffset: number | undefined,
		subString: string,
		encoding?: string
	): void;
	writeString(subString: string, encoding?: string): void;
	getChar(byteOffset?: number): string;
	setChar(byteOffset: number | undefined, character: string): void;
	writeChar(character: string): void;

	// The Signed and Unsigned methods have unique signatures
	getSigned(bitLength: number, byteOffset?: number): number;
	getUnsigned(bitLength: number, byteOffset?: number): number;
	setSigned(
		byteOffset: number | undefined,
		value: number,
		bitLength: number
	): void;
	setUnsigned(
		byteOffset: number | undefined,
		value: number,
		bitLength: number
	): void;
	writeSigned(value: number, bitLength: number): void;
	writeUnsigned(value: number, bitLength: number): void;

	static from(...data: Bufferish[]): jDataView;

	// Seek, skip, etc methods
	seek(byteOffset: number): number;
	skip(byteLength: number): number;
	slice(start: number, end?: number, forceCopy?: boolean): jDataView;
	alignBy(byteCount?: number): number;
	tell(): number;
	tellBit(): number;
}

export { jDataView };
export default jDataView;
