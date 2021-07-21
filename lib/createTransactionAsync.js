"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionAsync = void 0;
const tslib_1 = require("tslib");
const transaction_1 = tslib_1.__importDefault(require("arweave/node/lib/transaction"));
const utils_1 = require("arweave/node/lib/utils");
// @ts-ignore
const promises_1 = require("stream/promises");
const generateTransactionAsync_1 = require("./generateTransactionAsync");
/**
 * Creates an Arweave transaction from the piped data stream.
 */
function createTransactionAsync(attributes, arweave, jwk) {
    return function (source) {
        var _a, _b, _c;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const chunks = yield promises_1.pipeline(source, generateTransactionAsync_1.generateTransactionChunksAsync());
            const txAttrs = Object.assign({}, attributes);
            (_a = txAttrs.owner) !== null && _a !== void 0 ? _a : (txAttrs.owner = jwk === null || jwk === void 0 ? void 0 : jwk.n);
            (_b = txAttrs.last_tx) !== null && _b !== void 0 ? _b : (txAttrs.last_tx = yield arweave.transactions.getTransactionAnchor());
            const lastChunk = chunks.chunks[chunks.chunks.length - 1];
            const dataByteLength = lastChunk.maxByteRange;
            (_c = txAttrs.reward) !== null && _c !== void 0 ? _c : (txAttrs.reward = yield arweave.transactions.getPrice(dataByteLength, txAttrs.target));
            txAttrs.data_size = dataByteLength.toString();
            const tx = new transaction_1.default(txAttrs);
            tx.chunks = chunks;
            tx.data_root = utils_1.bufferTob64Url(chunks.data_root);
            return tx;
        });
    };
}
exports.createTransactionAsync = createTransactionAsync;
//# sourceMappingURL=createTransactionAsync.js.map