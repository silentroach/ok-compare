import { createServer } from 'node:net';

const port = Number(process.argv[2]);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error('Port argument is required');
}

const host = '127.0.0.1';

await new Promise((resolve, reject) => {
  const srv = createServer();

  srv.once('error', (err) => {
    reject(err);
  });

  srv.once('listening', () => {
    srv.close((err) => {
      if (err) reject(err);
      else resolve(undefined);
    });
  });

  srv.listen(port, host);
}).catch((err) => {
  if (
    err &&
    typeof err === 'object' &&
    'code' in err &&
    err.code === 'EADDRINUSE'
  ) {
    throw new Error(
      `Port ${port} is already in use. Stop the old dev server and try again.`,
    );
  }

  throw err;
});
