import Arweave from 'arweave';
import { CreateTransactionInterface } from 'arweave/node/common';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
// @ts-ignore
import { pipeline } from 'stream/promises';
import {createTransactionAsync} from "../createTransactionAsync";


describe('createTransactionAsync', () => {
    let wallet: JWKInterface;

    beforeAll(async () => {
        wallet = await arweave.wallets.generate();
    });

    const arweave = new Arweave({
        host: 'arweave.net',
        protocol: 'https',
        port: 443,
        logging: false,
        timeout: 15000,
    });

    it('should create transactions that match arweave-js', async () => {
        const filePath = './package-lock.json';
        const fileStream = createReadStream(filePath);

        const txAttrs = <Partial<CreateTransactionInterface>>{
            last_tx: 'MOCK_TX_ID',
            reward: '1',
        };

        const tx = await pipeline(fileStream, createTransactionAsync(txAttrs, arweave, wallet));

        const nativeTx = await arweave.createTransaction({ ...txAttrs, data: await readFile(filePath) }, wallet);

        await arweave.transactions.sign(tx, wallet);
        await arweave.transactions.sign(nativeTx, wallet);

        // Reset the data field from the `arweave-js` transaction as streamed transactions will not have this field.
        nativeTx.data = new Uint8Array(0);

        expect(tx).toMatchObject(nativeTx);
    });
});
