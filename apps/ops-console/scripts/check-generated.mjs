import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const generated = join(root, '..', 'src', 'generated', 'graphql.ts');
const stamp = join(root, '..', 'src', 'generated', '.graphql.sha256');
const schema = join(root, '..', '..', '..', 'packages', 'contracts', 'schema.graphql');

if (!existsSync(generated) || !existsSync(stamp) || !existsSync(schema)) {
  console.error('Missing GraphQL schema or generated client. Run task contracts.');
  process.exit(1);
}

const hash = createHash('sha256')
  .update(readFileSync(schema))
  .update(readFileSync(generated))
  .digest('hex');
const expected = readFileSync(stamp, 'utf8').trim();
if (hash !== expected) {
  console.error('Generated GraphQL client is stale. Run npm --workspace apps/ops-console run codegen && python scripts/stamp_graphql.py');
  process.exit(1);
}
console.log('graphql client is up to date');
