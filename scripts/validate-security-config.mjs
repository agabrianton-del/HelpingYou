import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);

const dockerCompose = readFileSync(resolve(repoRoot, 'docker-compose.yml'), 'utf8');
const envExample = readFileSync(resolve(repoRoot, '.env.example'), 'utf8');

const failures = [];

const forbiddenPatterns = [
  {
    file: 'docker-compose.yml',
    pattern: /:\s*\$\{DB_PASSWORD:-password\}/,
    message: 'PostgreSQL password must not default to "password".',
  },
  {
    file: 'docker-compose.yml',
    pattern: /:\s*\$\{MONGO_PASSWORD:-password\}/,
    message: 'MongoDB password must not default to "password".',
  },
  {
    file: 'docker-compose.yml',
    pattern: /:\s*\$\{JWT_SECRET:-dev-secret-key-change-in-production\}/,
    message: 'JWT secret must not default to a known development value.',
  },
  {
    file: '.env.example',
    pattern: /^DB_PASSWORD=password$/m,
    message: '.env.example must not suggest "password" as the database password.',
  },
  {
    file: '.env.example',
    pattern: /^MONGO_PASSWORD=password$/m,
    message: '.env.example must not suggest "password" as the MongoDB password.',
  },
  {
    file: '.env.example',
    pattern: /^JWT_SECRET=dev-secret-key-change-in-production$/m,
    message: '.env.example must not suggest a known JWT secret.',
  },
  {
    file: '.env.example',
    pattern: /^JWT_REFRESH_SECRET=dev-refresh-secret-key-change-in-production$/m,
    message: '.env.example must not suggest a known refresh-token secret.',
  },
];

for (const { file, pattern, message } of forbiddenPatterns) {
  const content = file === 'docker-compose.yml' ? dockerCompose : envExample;
  if (pattern.test(content)) {
    failures.push(`${file}: ${message}`);
  }
}

if (!/mailhog:\n(?:.*\n)*?\s+profiles:\n(?:.*\n)*?\s+- tools/m.test(dockerCompose)) {
  failures.push('docker-compose.yml: mailhog must be isolated behind the tools profile.');
}

if (!/pgadmin:\n(?:.*\n)*?\s+profiles:\n(?:.*\n)*?\s+- tools/m.test(dockerCompose)) {
  failures.push('docker-compose.yml: pgadmin must be isolated behind the tools profile.');
}

if (!/adminer:\n(?:.*\n)*?\s+profiles:\n(?:.*\n)*?\s+- tools/m.test(dockerCompose)) {
  failures.push('docker-compose.yml: adminer must be isolated behind the tools profile.');
}

if (!/elasticsearch:\n(?:.*\n)*?\s+profiles:\n(?:.*\n)*?\s+- search/m.test(dockerCompose)) {
  failures.push('docker-compose.yml: elasticsearch must be isolated behind the search profile.');
}

if (!/xpack\.security\.enabled=\$\{ELASTICSEARCH_SECURITY_ENABLED:-false\}/.test(dockerCompose)) {
  failures.push('docker-compose.yml: elasticsearch security must be explicitly gated by ELASTICSEARCH_SECURITY_ENABLED.');
}

const localhostPorts = [
  '"${DB_PORT:-5432}:5432"',
  '"${REDIS_PORT:-6379}:6379"',
  '"${MONGO_PORT:-27017}:27017"',
  '"${ES_PORT:-9200}:9200"',
  '"${MAILHOG_PORT:-1025}:1025"',
  '"${MAILHOG_UI_PORT:-8025}:8025"',
  '"${PGADMIN_PORT:-5050}:80"',
  '"${ADMINER_PORT:-8080}:8080"',
];

for (const portMapping of localhostPorts) {
  if (dockerCompose.includes(`- ${portMapping}`)) {
    failures.push(`docker-compose.yml: ${portMapping} must bind to 127.0.0.1.`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
