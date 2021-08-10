# Arweave Stream

Uses [this gist](https://gist.github.com/CDDelta/e2af7e02314b2e0c3b5f9eb616c645a6) by [CDDelta](https://gist.github.com/CDDelta)

Library for creating, signing and posting transactions using NodeJS streams

## Create, sign and post transaction

```ts

const stream1 = fs.createReadStream("somefile");
const options = {
  tags: new Tag("some_name", "some_value")
}
const tx = await pipeline(stream1, createTransactionAsync(options, arweave, jwk))
    .catch(logger.error);

await arweave.transactions.sign(tx, jwk);

// You need to recreate the stream for posting
const streams2 = fs.createReadStream("somefile");

await pipeline(streams2, uploadTransactionAsync(tx, arweave, true))
  .catch(logger.error);
```
