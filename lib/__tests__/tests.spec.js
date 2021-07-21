"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const arweave_1 = tslib_1.__importDefault(require("arweave"));
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
// @ts-ignore
const promises_2 = require("stream/promises");
const createTransactionAsync_1 = require("../createTransactionAsync");
describe('createTransactionAsync', () => {
    let wallet;
    beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        wallet = yield arweave.wallets.generate();
    }));
    const arweave = new arweave_1.default({
        host: 'arweave.net',
        protocol: 'https',
        port: 443,
        logging: false,
        timeout: 15000,
    });
    it('should create transactions that match arweave-js', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const filePath = './package-lock.json';
        const fileStream = fs_1.createReadStream(filePath);
        const txAttrs = {
            last_tx: 'MOCK_TX_ID',
            reward: '1',
        };
        const tx = yield promises_2.pipeline(fileStream, createTransactionAsync_1.createTransactionAsync(txAttrs, arweave, wallet));
        const nativeTx = yield arweave.createTransaction(Object.assign(Object.assign({}, txAttrs), { data: yield promises_1.readFile(filePath) }), wallet);
        yield arweave.transactions.sign(tx, wallet);
        yield arweave.transactions.sign(nativeTx, wallet);
        // Reset the data field from the `arweave-js` transaction as streamed transactions will not have this field.
        nativeTx.data = new Uint8Array(0);
        expect(tx).toMatchObject(nativeTx);
    }));
});
//# sourceMappingURL=tests.spec.js.map