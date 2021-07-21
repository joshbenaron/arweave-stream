"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTransactionChunksAsync = void 0;
const tslib_1 = require("tslib");
const arweave_1 = tslib_1.__importDefault(require("arweave"));
const merkle_1 = require("arweave/node/lib/merkle");
const stream_chunker_1 = tslib_1.__importDefault(require("stream-chunker"));
const promises_1 = require("stream/promises");
/**
 * Generates the Arweave transaction chunk information from the piped data stream.
 */
function generateTransactionChunksAsync() {
    return (source) => tslib_1.__awaiter(this, void 0, void 0, function* () {
        const chunks = [];
        /**
         * @param chunkByteIndex the index the start of the specified chunk is located at within its original data stream.
         */
        function addChunk(chunkByteIndex, chunk) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const dataHash = yield arweave_1.default.crypto.hash(chunk);
                const chunkRep = {
                    dataHash,
                    minByteRange: chunkByteIndex,
                    maxByteRange: chunkByteIndex + chunk.byteLength,
                };
                chunks.push(chunkRep);
                return chunkRep;
            });
        }
        let chunkStreamByteIndex = 0;
        let previousDataChunk;
        let expectChunkGenerationCompleted = false;
        yield promises_1.pipeline(source, stream_chunker_1.default(merkle_1.MAX_CHUNK_SIZE, { flush: true }), function (chunkedSource) {
            var chunkedSource_1, chunkedSource_1_1;
            var e_1, _a;
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    for (chunkedSource_1 = tslib_1.__asyncValues(chunkedSource); chunkedSource_1_1 = yield chunkedSource_1.next(), !chunkedSource_1_1.done;) {
                        const chunk = chunkedSource_1_1.value;
                        if (expectChunkGenerationCompleted) {
                            throw Error('Expected chunk generation to have completed.');
                        }
                        if (chunk.byteLength >= merkle_1.MIN_CHUNK_SIZE && chunk.byteLength <= merkle_1.MAX_CHUNK_SIZE) {
                            yield addChunk(chunkStreamByteIndex, chunk);
                        }
                        else if (chunk.byteLength < merkle_1.MIN_CHUNK_SIZE) {
                            // TODO: Add tests to explicitly test this condition.
                            if (previousDataChunk) {
                                // If this final chunk is smaller than the minimum chunk size, rebalance this final chunk and
                                // the previous chunk to keep the final chunk size above the minimum threshold.
                                const remainingBytes = Buffer.concat([previousDataChunk, chunk], previousDataChunk.byteLength + chunk.byteLength);
                                const rebalancedSizeForPreviousChunk = Math.ceil(remainingBytes.byteLength / 2);
                                const previousChunk = chunks.pop();
                                const rebalancedPreviousChunk = yield addChunk(previousChunk.minByteRange, remainingBytes.slice(0, rebalancedSizeForPreviousChunk));
                                yield addChunk(rebalancedPreviousChunk.maxByteRange, remainingBytes.slice(rebalancedSizeForPreviousChunk));
                            }
                            else {
                                // This entire stream should be smaller than the minimum chunk size, just add the chunk in.
                                yield addChunk(chunkStreamByteIndex, chunk);
                            }
                            expectChunkGenerationCompleted = true;
                        }
                        else if (chunk.byteLength > merkle_1.MAX_CHUNK_SIZE) {
                            throw Error('Encountered chunk larger than max chunk size.');
                        }
                        chunkStreamByteIndex += chunk.byteLength;
                        previousDataChunk = chunk;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (chunkedSource_1_1 && !chunkedSource_1_1.done && (_a = chunkedSource_1.return)) yield _a.call(chunkedSource_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            });
        });
        const leaves = yield merkle_1.generateLeaves(chunks);
        const root = yield merkle_1.buildLayers(leaves);
        const proofs = yield merkle_1.generateProofs(root);
        return {
            data_root: root.id,
            chunks,
            proofs,
        };
    });
}
exports.generateTransactionChunksAsync = generateTransactionChunksAsync;
//# sourceMappingURL=generateTransactionAsync.js.map