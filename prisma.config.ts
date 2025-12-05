import { defineConfig } from 'prisma/config';

export default defineConfig({
  seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  env: {
    path: ['.env.local', '.env'],
  },
});
