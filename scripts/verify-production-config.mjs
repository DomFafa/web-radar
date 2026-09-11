import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
const failures = [];
if (config.vars?.TEST_PROVIDERS !== 'false' || config.vars?.ENVIRONMENT !== 'production')
  failures.push('Default environment must be production with test providers disabled');
if (
  config.d1_databases?.some(
    (d) => !d.database_id || d.database_id === '00000000-0000-0000-0000-000000000000',
  )
)
  failures.push('Production D1 binding still has a local placeholder ID');
if (!config.r2_buckets?.length) failures.push('Dedicated R2 binding missing');
for (const name of ['APP_ORIGIN', 'PRODUCT_RADAR_BASE_URL', 'PRODUCT_RADAR_PARENT_ORIGINS'])
  if (!config.vars?.[name]) failures.push(`${name} is not in production non-secret config`);
console.log(
  JSON.stringify(
    {
      ready: failures.length === 0,
      failures,
      checksOnly: 'No secrets inspected and no resources created',
    },
    null,
    2,
  ),
);
process.exitCode = failures.length ? 1 : 0;
